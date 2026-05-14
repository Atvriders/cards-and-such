import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  cpuChoose,
  canAfford,
  canBuildWonderStage,
  scienceScore,
  computeFinalScore,
  buildDeck,
  WONDERS,
  NUM_PLAYERS,
  HAND_SIZE,
  NUM_AGES,
  STARTING_COINS,
} from "./state.js";
import type {
  SevenWondersFullState,
  SevenWondersFullAction,
  Card,
  PlayerState,
} from "./state.js";

const settings = {} as { _dummy?: boolean };

function clonePlain<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

describe("7-wonders-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, settings);
    const b = initialState(123, settings);
    expect(clonePlain(a)).toEqual(clonePlain(b));
  });

  it("creates 4 players, each with a 7-card hand, unique wonders, starting coins", () => {
    const s = initialState(7, settings);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    for (const p of s.players) {
      expect(p.hand).toHaveLength(HAND_SIZE);
      expect(p.coins).toBe(STARTING_COINS);
      expect(p.tableau).toHaveLength(0);
    }
    const wonders = new Set(s.players.map((p) => p.wonderIdx));
    expect(wonders.size).toBe(NUM_PLAYERS);
    expect(s.age).toBe(1);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("playing");
    expect(s.players[0]?.name).toBe("You");
    expect(s.players[0]?.isCpu).toBe(false);
    expect(s.players[1]?.isCpu).toBe(true);
  });

  it("isTerminal is null on a fresh game", () => {
    expect(isTerminal(initialState(99, settings))).toBeNull();
  });

  it("buildDeck returns 28 cards from the correct age", () => {
    const rng = () => 0.5;
    const d1 = buildDeck(1, rng);
    expect(d1).toHaveLength(NUM_PLAYERS * HAND_SIZE);
    for (const c of d1) expect(c.age).toBe(1);
    const d3 = buildDeck(3, rng);
    for (const c of d3) expect(c.age).toBe(3);
  });
});

describe("7-wonders-full reducer — selectCard", () => {
  it("records pending selection for human player", () => {
    const s = initialState(5, settings);
    const human = s.players[0];
    if (!human || human.hand.length === 0) throw new Error("no human");
    // pick a card we know is free (cost 0 most age-1 cards) — find one
    let idx = human.hand.findIndex((c) => c.cost === 0);
    if (idx < 0) idx = 0;
    const card = human.hand[idx] as Card;
    const action: SevenWondersFullAction = {
      type: "selectCard",
      cardIdx: idx,
      action: canAfford(human, card.cost) ? "play" : "discard",
    };
    const next = reducer(s, action);
    expect(next.players[0]?.pendingCardIdx).toBe(idx);
    expect(next.players[0]?.pendingAction).not.toBeNull();
  });

  it("rejects out-of-range card indices and returns same reference", () => {
    const s = initialState(5, settings);
    const out = reducer(s, { type: "selectCard", cardIdx: 99, action: "discard" });
    expect(out).toBe(s);
    const neg = reducer(s, { type: "selectCard", cardIdx: -1, action: "discard" });
    expect(neg).toBe(s);
  });

  it("rejects play action when card is unaffordable", () => {
    // Construct a synthetic state where human has 0 coins and 0 production
    const base = initialState(5, settings);
    const human = base.players[0];
    if (!human) throw new Error("no human");
    const expensive: Card = {
      id: "test-x",
      name: "Test",
      color: "blue",
      age: 1,
      cost: 5,
      produces: 0,
      coins: 0,
      vp: 4,
      shields: 0,
      science: null,
      guild: false,
    };
    const tweaked: SevenWondersFullState = {
      ...base,
      players: base.players.map((p, i) =>
        i === 0 ? { ...p, hand: [expensive, ...p.hand.slice(1)], coins: 0 } : p,
      ),
    };
    const out = reducer(tweaked, { type: "selectCard", cardIdx: 0, action: "play" });
    expect(out).toBe(tweaked);
  });
});

describe("7-wonders-full reducer — resolveRound", () => {
  it("advances the round counter after human + CPUs commit", () => {
    let s = initialState(11, settings);
    const human = s.players[0];
    if (!human) throw new Error("no human");
    // Always discard — guaranteed legal.
    s = reducer(s, { type: "selectCard", cardIdx: 0, action: "discard" });
    s = reducer(s, { type: "resolveRound" });
    expect(s.round).toBe(2);
    expect(s.phase).toBe("playing");
    // Hands rotated → human still has 6 cards.
    expect(s.players[0]?.hand).toHaveLength(HAND_SIZE - 1);
  });

  it("requires human selection before resolving — refuses otherwise", () => {
    const s = initialState(11, settings);
    const out = reducer(s, { type: "resolveRound" });
    expect(out).toBe(s);
  });

  it("transitions to military at end of an age", () => {
    let s = initialState(2, settings);
    // Play 7 rounds; always discard for simplicity.
    for (let r = 0; r < HAND_SIZE; r++) {
      const human = s.players[0];
      if (!human || human.hand.length === 0) break;
      s = reducer(s, { type: "selectCard", cardIdx: 0, action: "discard" });
      s = reducer(s, { type: "resolveRound" });
    }
    expect(s.phase).toBe("military");
    expect(s.age).toBe(1);
  });

  it("resolveMilitary transitions to next age and refills hands", () => {
    let s = initialState(2, settings);
    for (let r = 0; r < HAND_SIZE; r++) {
      const human = s.players[0];
      if (!human || human.hand.length === 0) break;
      s = reducer(s, { type: "selectCard", cardIdx: 0, action: "discard" });
      s = reducer(s, { type: "resolveRound" });
    }
    expect(s.phase).toBe("military");
    s = reducer(s, { type: "resolveMilitary" });
    expect(s.phase).toBe("playing");
    expect(s.age).toBe(2);
    for (const p of s.players) expect(p.hand).toHaveLength(HAND_SIZE);
  });
});

describe("7-wonders-full scoring helpers", () => {
  function emptyPlayer(): PlayerState {
    return {
      seat: 0,
      name: "P",
      wonderIdx: 0,
      stagesBuilt: 0,
      hand: [],
      tableau: [],
      coins: 0,
      shields: 0,
      militaryTokens: [],
      pendingCardIdx: -1,
      pendingAction: null,
      isCpu: false,
    };
  }

  it("scienceScore rewards sets and matched triples", () => {
    const mkSci = (sym: "tablet" | "compass" | "gear"): Card => ({
      id: "x", name: "S", color: "green", age: 1, cost: 0, produces: 0, coins: 0, vp: 0, shields: 0, science: sym, guild: false,
    });
    const p = emptyPlayer();
    p.tableau = [mkSci("tablet"), mkSci("compass"), mkSci("gear")];
    // 1 of each: 1 + 1 + 1 + 1 set(7) = 10
    expect(scienceScore(p)).toBe(10);

    p.tableau = [mkSci("tablet"), mkSci("tablet"), mkSci("tablet")];
    // 3 tablets: 9 + 0 + 0 + 0 sets = 9
    expect(scienceScore(p)).toBe(9);
  });

  it("computeFinalScore sums civilian + military + treasury + wonder + science", () => {
    const p = emptyPlayer();
    p.coins = 9; // +3 VP
    p.militaryTokens = [3, 3, -1]; // +5
    p.tableau = [
      { id: "a", name: "Temple", color: "blue", age: 1, cost: 0, produces: 0, coins: 0, vp: 3, shields: 0, science: null, guild: false },
      { id: "b", name: "Arena", color: "yellow", age: 3, cost: 0, produces: 0, coins: 0, vp: 2, shields: 0, science: null, guild: false },
    ];
    p.stagesBuilt = 1; // Giza stage 0 = 3 VP
    const score = computeFinalScore(p);
    // 3(coin) + 5(mil) + 3(blue) + 2(yellow) + 3(wonder stage)
    expect(score).toBe(3 + 5 + 3 + 2 + 3);
  });

  it("cpuChoose returns a valid choice for any non-empty hand", () => {
    const p = emptyPlayer();
    p.coins = 0;
    p.hand = [{
      id: "c", name: "Foo", color: "brown", age: 1, cost: 0, produces: 1,
      coins: 0, vp: 0, shields: 0, science: null, guild: false,
    }];
    const { idx, action } = cpuChoose(p);
    expect(idx).toBe(0);
    expect(["play", "wonder", "discard"]).toContain(action);
  });

  it("canBuildWonderStage handles boundary cases", () => {
    const p = emptyPlayer();
    p.coins = STARTING_COINS;
    const wonder = WONDERS[0];
    if (!wonder) throw new Error("no wonder");
    // Stage 0 costs 2 production. With 3 coins, trade is 2*2=4 > 3 → cannot afford.
    expect(canBuildWonderStage(p, wonder)).toBe(false);
    // Add a free brown producing 2.
    p.tableau.push({ id: "x", name: "Lumber", color: "brown", age: 1, cost: 0, produces: 2, coins: 0, vp: 0, shields: 0, science: null, guild: false });
    expect(canBuildWonderStage(p, wonder)).toBe(true);
  });
});

describe("7-wonders-full full play-through reaches a terminal score", () => {
  it("completes 3 ages and isTerminal returns a non-negative score", () => {
    let s = initialState(42, settings);
    for (let age = 1; age <= NUM_AGES; age++) {
      for (let r = 0; r < HAND_SIZE; r++) {
        const human = s.players[0];
        if (!human || human.hand.length === 0) break;
        // Pick a free or affordable card if possible, else discard.
        const affordableIdx = human.hand.findIndex((c) => canAfford(human, c.cost));
        const idx = affordableIdx >= 0 ? affordableIdx : 0;
        const card = human.hand[idx];
        const act: "play" | "discard" = (card && affordableIdx >= 0) ? "play" : "discard";
        s = reducer(s, { type: "selectCard", cardIdx: idx, action: act });
        s = reducer(s, { type: "resolveRound" });
      }
      if (s.phase === "military") s = reducer(s, { type: "resolveMilitary" });
    }
    // After all ages, should be in scoring or done with terminal score.
    expect(["scoring", "done"]).toContain(s.phase);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    if (t) expect(t.score).toBeGreaterThanOrEqual(0);
  });
});
