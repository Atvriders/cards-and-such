import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  scorePlayer,
  getBird,
  cpuChooseAction,
  ROUNDS,
  ACTIONS_PER_ROUND,
  HABITAT_SLOTS,
  TOTAL_BIRDS,
  BONUS_TILES,
} from "./state.js";
import type { WingspanFullState, WingspanFullAction, PlayerState } from "./state.js";

const SETTINGS = { cpuCount: 2 };

describe("WingspanFull — state", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, SETTINGS);
    const b = initialState(42, SETTINGS);
    expect(a.players.length).toBe(b.players.length);
    expect(a.players[0]?.hand).toEqual(b.players[0]?.hand);
    expect(a.deck).toEqual(b.deck);
    expect(a.bonusTiles).toEqual(b.bonusTiles);
    expect(a.round).toBe(0);
    expect(a.phase).toBe("playing");
  });

  it("initialState seeds different state per seed", () => {
    const a = initialState(1, SETTINGS);
    const b = initialState(9999, SETTINGS);
    // Deck order should differ for distinct seeds (high probability).
    expect(a.deck).not.toEqual(b.deck);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(5, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });

  it("playing all bird-card defs covers every habitat", () => {
    const habitats = new Set<string>();
    for (let id = 0; id < TOTAL_BIRDS; id++) {
      const card = getBird(id);
      if (card) habitats.add(card.habitat);
    }
    expect(habitats.has("forest")).toBe(true);
    expect(habitats.has("grassland")).toBe(true);
    expect(habitats.has("wetland")).toBe(true);
  });

  it("playing a bird removes it from hand, places on row, deducts food", () => {
    let s = initialState(42, SETTINGS);
    const p = s.players[0] as PlayerState;
    // Find a card in hand the player can afford.
    const card = p.hand.map((id) => getBird(id)).find((c) => c && c.cost <= p.food);
    if (!card) {
      // Skip if seed yields no playable card — unlikely with starting food 5.
      return;
    }
    const before = scorePlayer(p);
    const startFood = p.food;
    const action: WingspanFullAction = { type: "play_bird", cardId: card.id, habitat: card.habitat };
    const next = reducer(s, action);
    const np = next.players[0] as PlayerState;
    expect(np.hand.includes(card.id)).toBe(false);
    const row = card.habitat === "forest" ? np.forest : card.habitat === "grassland" ? np.grassland : np.wetland;
    expect(row.find((b) => b.cardId === card.id)).toBeTruthy();
    expect(np.food).toBe(startFood - card.cost);
    // Score should have changed (positive bird VP added). Note: bonus tiles
    // aren't applied yet, so the delta equals card.vp.
    expect(scorePlayer(np)).toBe(before + card.vp);
    // Active player should now be CPU 1.
    expect(next.current).toBe(1);
    s = next;
  });

  it("illegal play_bird returns same state reference", () => {
    const s = initialState(7, SETTINGS);
    // Use a wrong-habitat play
    const p = s.players[0] as PlayerState;
    const id = p.hand[0];
    if (id === undefined) return;
    const card = getBird(id);
    if (!card) return;
    const wrong: WingspanFullAction = {
      type: "play_bird",
      cardId: id,
      habitat: card.habitat === "forest" ? "grassland" : "forest",
    };
    const next = reducer(s, wrong);
    expect(next).toBe(s);
  });

  it("illegal play_bird (not in hand) returns same state reference", () => {
    const s = initialState(7, SETTINGS);
    const p = s.players[0] as PlayerState;
    // Find a card NOT in hand.
    const notInHand = Array.from({ length: TOTAL_BIRDS }, (_, i) => i).find((id) => !p.hand.includes(id));
    if (notInHand === undefined) return;
    const card = getBird(notInHand);
    if (!card) return;
    const bad: WingspanFullAction = { type: "play_bird", cardId: notInHand, habitat: card.habitat };
    const next = reducer(s, bad);
    expect(next).toBe(s);
  });

  it("use_habitat (forest) increases food by at least 1", () => {
    const s = initialState(3, SETTINGS);
    const before = (s.players[0] as PlayerState).food;
    const next = reducer(s, { type: "use_habitat", habitat: "forest" });
    const np = next.players[0] as PlayerState;
    expect(np.food).toBeGreaterThan(before);
    // Action used.
    expect(next.actionsLeft[0]).toBe(ACTIONS_PER_ROUND[0]! - 1);
    expect(next.current).toBe(1);
  });

  it("use_habitat (wetland) draws cards into hand", () => {
    const s = initialState(3, SETTINGS);
    const before = (s.players[0] as PlayerState).hand.length;
    const next = reducer(s, { type: "use_habitat", habitat: "wetland" });
    const np = next.players[0] as PlayerState;
    expect(np.hand.length).toBeGreaterThan(before);
  });

  it("cpu_step chooses a valid action and advances state", () => {
    // Make CPU 1 active by playing one human action.
    let s = initialState(11, SETTINGS);
    s = reducer(s, { type: "use_habitat", habitat: "forest" });
    expect(s.current).toBe(1);
    expect(s.players[1]?.isCPU).toBe(true);
    const action = cpuChooseAction(s, 1);
    expect(action.type === "play_bird" || action.type === "use_habitat").toBe(true);
    const next = reducer(s, { type: "cpu_step" });
    // Either CPU consumed an action, or game advanced.
    expect(next).not.toBe(s);
  });

  it("game ends after all rounds with a non-negative score", () => {
    // Drive the game to completion: human always uses Forest, CPUs auto.
    let s = initialState(123, SETTINGS);
    let guard = 0;
    while (s.phase !== "game_over" && guard++ < 2000) {
      if (s.phase === "round_end") {
        s = reducer(s, { type: "advance_round" });
        continue;
      }
      const seat = s.current;
      const cur = s.players[seat] as PlayerState;
      if (cur.isCPU) {
        s = reducer(s, { type: "cpu_step" });
      } else {
        // Try to use forest; if no actions left at all, advance via no-op.
        s = reducer(s, { type: "use_habitat", habitat: "forest" });
      }
    }
    expect(s.phase).toBe("game_over");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t?.score).toBeGreaterThanOrEqual(0);
  });

  it("round bonus tile awards points to the leader", () => {
    // Construct a synthetic state where player 0 has many forest birds; round = 3 (last); award.
    const s = initialState(2, SETTINGS);
    const p0 = s.players[0] as PlayerState;
    const p1 = s.players[1] as PlayerState;
    const synth: WingspanFullState = {
      ...s,
      round: 0,
      bonusTiles: ["most_forest", "most_eggs", "most_hand", "most_wetland_vp"],
      actionsLeft: s.players.map(() => 0), // force round end
      players: [
        { ...p0, forest: [
          { cardId: 0, eggs: 0, cached: 0, tucked: 0 },
          { cardId: 4, eggs: 0, cached: 0, tucked: 0 },
        ] },
        { ...p1, forest: [] },
        ...s.players.slice(2),
      ],
    };
    // Triggering any action with 0 actionsLeft should advance through the round.
    const next = reducer(synth, { type: "use_habitat", habitat: "forest" });
    expect(next.phase).toBe("round_end");
    expect((next.players[0] as PlayerState).bonusPoints).toBeGreaterThan(0);
  });

  it("HABITAT_SLOTS / ROUNDS / BONUS_TILES / ACTIONS_PER_ROUND sanity", () => {
    expect(HABITAT_SLOTS).toBe(5);
    expect(ROUNDS).toBe(4);
    expect(ACTIONS_PER_ROUND.length).toBe(ROUNDS);
    expect(BONUS_TILES.length).toBeGreaterThanOrEqual(4);
    expect(ACTIONS_PER_ROUND).toEqual([8, 7, 6, 5]);
  });

  it("scorePlayer sums VP, eggs, cached, tucked, bonusPoints", () => {
    const player: PlayerState = {
      forest: [{ cardId: 0, eggs: 2, cached: 1, tucked: 1 }], // robin vp 2 + 2 + 1 + 1 = 6
      grassland: [],
      wetland: [],
      hand: [],
      food: 0,
      foodByType: { worm: 0, grain: 0, fruit: 0, fish: 0, rodent: 0 },
      bonusPoints: 3,
      bonusCard: "most_eggs",
      isCPU: false,
    };
    // 2 (robin VP) + 2 (eggs) + 1 (cached) + 1 (tucked) + 3 (bonus) = 9
    expect(scorePlayer(player)).toBe(9);
  });
});
