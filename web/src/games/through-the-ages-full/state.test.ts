import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  cpuPickCard,
  buildAgeDeck,
  productionTotals,
  computeFinalScore,
  ageLabel,
  NUM_PLAYERS,
  NUM_AGES,
  CARD_ROW_SIZE,
  STARTING_POP,
  STARTING_STRENGTH,
  CIVIL_TOKENS_BY_AGE,
  MILITARY_TOKENS_BY_AGE,
} from "./state.js";
import type {
  ThroughTheAgesFullState,
  ThroughTheAgesFullAction,
  PlayerState,
  Card,
} from "./state.js";

const settings = {} as { _dummy?: boolean };

function clonePlain<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

describe("through-the-ages-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, settings);
    const b = initialState(123, settings);
    expect(clonePlain(a)).toEqual(clonePlain(b));
  });

  it("different seeds usually produce different decks", () => {
    const a = initialState(1, settings);
    const b = initialState(99999, settings);
    // Card row ids should differ for at least one slot.
    const sameAll = a.cardRow.every((c, i) => c.id === b.cardRow[i]?.id && c.name === b.cardRow[i]?.name);
    expect(sameAll).toBe(false);
  });

  it("creates 4 players with starting resources & tokens", () => {
    const s = initialState(7, settings);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    for (const p of s.players) {
      expect(p.tableau).toHaveLength(0);
      expect(p.workers).toBe(STARTING_POP);
      expect(p.strength).toBe(STARTING_STRENGTH);
      expect(p.civilTokens).toBe(CIVIL_TOKENS_BY_AGE[0]);
      expect(p.militaryTokens).toBe(MILITARY_TOKENS_BY_AGE[0]);
    }
    expect(s.players[0]?.isCpu).toBe(false);
    expect(s.players[0]?.name).toBe("You");
    expect(s.players[1]?.isCpu).toBe(true);
    expect(s.age).toBe(0);
    expect(s.phase).toBe("turn");
    expect(s.turn).toBe(0);
  });

  it("seeds a full card row from age A", () => {
    const s = initialState(42, settings);
    expect(s.cardRow).toHaveLength(CARD_ROW_SIZE);
    for (const c of s.cardRow) expect(c.age).toBe(0);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(0, settings))).toBeNull();
  });

  it("ageLabel converts numeric indices to roman style", () => {
    expect(ageLabel(0)).toBe("A");
    expect(ageLabel(1)).toBe("I");
    expect(ageLabel(2)).toBe("II");
    expect(ageLabel(3)).toBe("III");
  });

  it("buildAgeDeck produces 12 cards from the requested age", () => {
    const rng = () => 0.5;
    const d = buildAgeDeck(2, rng);
    expect(d).toHaveLength(12);
    for (const c of d) expect(c.age).toBe(2);
  });
});

describe("through-the-ages-full reducer — takeCard", () => {
  it("adds card to tableau and consumes tokens", () => {
    const s = initialState(5, settings);
    // Find an affordable card in the row.
    const human = s.players[0];
    if (!human) throw new Error("no human");
    const idx = s.cardRow.findIndex((c) => {
      const isMil = c.kind === "mil-bonus" || c.kind === "mil-aggression";
      const tokens = isMil ? human.militaryTokens : human.civilTokens;
      return c.civilCost <= tokens && c.stoneCost <= human.stone;
    });
    expect(idx).toBeGreaterThanOrEqual(0);
    const card = s.cardRow[idx] as Card;
    const next = reducer(s, { type: "takeCard", cardIdx: idx });
    expect(next.cardRow).toHaveLength(CARD_ROW_SIZE - 1);
    expect(next.players[0]?.tableau).toHaveLength(1);
    expect(next.players[0]?.tableau[0]?.id).toBe(card.id);
  });

  it("rejects out-of-range card indices and returns same reference", () => {
    const s = initialState(5, settings);
    const out = reducer(s, { type: "takeCard", cardIdx: 99 });
    expect(out).toBe(s);
    const neg = reducer(s, { type: "takeCard", cardIdx: -1 });
    expect(neg).toBe(s);
  });

  it("rejects taking a card when stone-cost exceeds stone available", () => {
    // Force the state so human has 0 stone and the first card costs stone.
    const base = initialState(5, settings);
    const expensive: Card = {
      id: "test-1",
      name: "Test Wonder",
      age: 0,
      kind: "civ-wonder",
      civilCost: 1,
      stoneCost: 99,
      produces: null,
      productionAmount: 0,
      strengthBonus: 0,
      cultureOnPlay: 5,
      recurringCulture: 0,
      happiness: 0,
    };
    const tweaked: ThroughTheAgesFullState = {
      ...base,
      cardRow: [expensive, ...base.cardRow.slice(1)],
      players: base.players.map((p, i) => (i === 0 ? { ...p, stone: 0 } : p)),
    };
    const out = reducer(tweaked, { type: "takeCard", cardIdx: 0 });
    expect(out).toBe(tweaked);
  });
});

describe("through-the-ages-full reducer — levy + endTurn", () => {
  it("levyCivil consumes 1 civil token + 1 food and adds a worker", () => {
    const s = initialState(11, settings);
    const before = s.players[0];
    if (!before) throw new Error("no human");
    const out = reducer(s, { type: "levyCivil" });
    const after = out.players[0];
    expect(after?.civilTokens).toBe(before.civilTokens - 1);
    expect(after?.workers).toBe(before.workers + 1);
    expect(after?.food).toBe(before.food - 1);
    expect(after?.popReserve).toBe(before.popReserve - 1);
  });

  it("levyMilitary consumes 1 mil token + 1 worker and adds +1 strength", () => {
    const s = initialState(11, settings);
    const before = s.players[0];
    if (!before) throw new Error("no human");
    const out = reducer(s, { type: "levyMilitary" });
    const after = out.players[0];
    expect(after?.militaryTokens).toBe(before.militaryTokens - 1);
    expect(after?.workers).toBe(before.workers - 1);
    expect((after?.strength ?? 0)).toBeGreaterThan(before.strength);
  });

  it("levyCivil returns same state ref when conditions not met", () => {
    const base = initialState(11, settings);
    const tweaked: ThroughTheAgesFullState = {
      ...base,
      players: base.players.map((p, i) => (i === 0 ? { ...p, food: 0 } : p)),
    };
    const out = reducer(tweaked, { type: "levyCivil" });
    expect(out).toBe(tweaked);
  });

  it("endTurn advances through CPU players back to human", () => {
    const s = initialState(2, settings);
    const next = reducer(s, { type: "endTurn" });
    // After all CPUs ran, turn should be back to 0 with phase still 'turn' OR an age transition triggered.
    expect(["turn", "end-of-age"]).toContain(next.phase);
    if (next.phase === "turn") {
      expect(next.turn).toBe(0);
    }
  });
});

describe("through-the-ages-full helpers", () => {
  function emptyPlayer(): PlayerState {
    return {
      seat: 0,
      name: "P",
      isCpu: false,
      civilTokens: 0,
      militaryTokens: 0,
      workers: 0,
      popReserve: 0,
      food: 0,
      stone: 0,
      science: 0,
      strength: STARTING_STRENGTH,
      culture: 0,
      happiness: 0,
      tableau: [],
      militaryAgeVp: [],
    };
  }

  it("productionTotals sums building production by resource", () => {
    const p = emptyPlayer();
    p.tableau = [
      { id: "a", name: "Agri", age: 0, kind: "civ-building", civilCost: 1, stoneCost: 0, produces: "food", productionAmount: 2, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
      { id: "b", name: "Iron", age: 1, kind: "civ-building", civilCost: 1, stoneCost: 0, produces: "stone", productionAmount: 3, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
      { id: "c", name: "Sci", age: 2, kind: "civ-building", civilCost: 1, stoneCost: 0, produces: "science", productionAmount: 4, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
    ];
    const prod = productionTotals(p);
    expect(prod.food).toBe(2);
    expect(prod.stone).toBe(3);
    expect(prod.science).toBe(4);
    expect(prod.strength).toBe(0);
  });

  it("cpuPickCard prefers cheapest affordable card", () => {
    const p = emptyPlayer();
    p.civilTokens = 2;
    p.militaryTokens = 0;
    p.stone = 99;
    const cards: Card[] = [
      { id: "x", name: "Expensive", age: 0, kind: "civ-building", civilCost: 5, stoneCost: 0, produces: "food", productionAmount: 1, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
      { id: "y", name: "Cheap", age: 0, kind: "civ-building", civilCost: 1, stoneCost: 0, produces: "stone", productionAmount: 1, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
      { id: "z", name: "MidCost", age: 0, kind: "civ-building", civilCost: 2, stoneCost: 0, produces: "science", productionAmount: 1, strengthBonus: 0, cultureOnPlay: 0, recurringCulture: 0, happiness: 0 },
    ];
    const idx = cpuPickCard(p, cards);
    expect(idx).toBe(1); // 'Cheap'
  });

  it("cpuPickCard returns -1 on empty row", () => {
    const p = emptyPlayer();
    p.civilTokens = 4;
    expect(cpuPickCard(p, [])).toBe(-1);
  });

  it("computeFinalScore sums culture + science/3", () => {
    const p = emptyPlayer();
    p.culture = 12;
    p.science = 9; // +3
    const score = computeFinalScore(p);
    expect(score).toBe(15);
  });
});

describe("through-the-ages-full full play-through reaches terminal", () => {
  it("eventually transitions to scoring phase via repeated endTurn", () => {
    let s = initialState(42, settings);
    // Play up to 200 turns, always end-turning, occasionally taking a card.
    for (let step = 0; step < 200; step++) {
      if (isTerminal(s)) break;
      if (s.phase === "end-of-age") {
        s = reducer(s, { type: "resolveAge" });
        continue;
      }
      if (s.phase === "turn" && s.turn === 0) {
        // Try to take the first affordable card.
        const human = s.players[0];
        let took = false;
        if (human) {
          for (let i = 0; i < s.cardRow.length; i++) {
            const c = s.cardRow[i] as Card;
            const isMil = c.kind === "mil-bonus" || c.kind === "mil-aggression";
            const tokens = isMil ? human.militaryTokens : human.civilTokens;
            if (c.civilCost <= tokens && c.stoneCost <= human.stone) {
              const before = s;
              s = reducer(s, { type: "takeCard", cardIdx: i });
              if (s !== before) { took = true; break; }
            }
          }
        }
        if (!took) {
          s = reducer(s, { type: "endTurn" });
        } else {
          // Continue picking next iteration.
        }
        continue;
      }
      // Otherwise just attempt to advance.
      s = reducer(s, { type: "endTurn" });
    }
    expect(["scoring", "done"]).toContain(s.phase);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    if (t) expect(t.score).toBeGreaterThanOrEqual(0);
  });

  it("game completes when run with all-pass strategy", () => {
    let s = initialState(7, settings);
    for (let step = 0; step < 400; step++) {
      if (isTerminal(s)) break;
      if (s.phase === "end-of-age") s = reducer(s, { type: "resolveAge" });
      else s = reducer(s, { type: "endTurn" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

describe("through-the-ages-full game phases progress through ages", () => {
  it("number of ages is 4", () => {
    expect(NUM_AGES).toBe(4);
  });

  it("CIVIL_TOKENS_BY_AGE length matches NUM_AGES", () => {
    expect(CIVIL_TOKENS_BY_AGE.length).toBe(NUM_AGES);
    expect(MILITARY_TOKENS_BY_AGE.length).toBe(NUM_AGES);
  });

  it("rejects action when game is in done phase", () => {
    const s = initialState(0, settings);
    const finished: ThroughTheAgesFullState = { ...s, phase: "done" };
    const action: ThroughTheAgesFullAction = { type: "endTurn" };
    expect(reducer(finished, action)).toBe(finished);
  });
});
