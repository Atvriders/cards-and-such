import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal, score,
  N_TERR, ADJ, isAdjacent, isConnectedFriendly,
  TERRITORIES, CONTINENTS, cardSetValue, isValidSet, findValidSet,
  continentBonus, reinforcementsFor,
} from "./state.js";
import type { RiskFullState, RiskFullAction, Card } from "./state.js";

const S = { startingArmies: 40, cpuAggression: 1 };

describe("risk-full world map", () => {
  it("has exactly 42 territories", () => {
    expect(TERRITORIES.length).toBe(42);
    expect(N_TERR).toBe(42);
  });

  it("has 6 continents with correct sizes", () => {
    const counts: Record<string, number> = {};
    for (const t of TERRITORIES) counts[t.cont] = (counts[t.cont] ?? 0) + 1;
    expect(counts["na"]).toBe(9);
    expect(counts["sa"]).toBe(4);
    expect(counts["eu"]).toBe(7);
    expect(counts["af"]).toBe(6);
    expect(counts["as"]).toBe(12);
    expect(counts["au"]).toBe(4);
  });

  it("continent bonuses match classic values", () => {
    const byId = Object.fromEntries(CONTINENTS.map(c => [c.id, c.bonus] as const));
    expect(byId["na"]).toBe(5);
    expect(byId["sa"]).toBe(2);
    expect(byId["eu"]).toBe(5);
    expect(byId["af"]).toBe(3);
    expect(byId["as"]).toBe(7);
    expect(byId["au"]).toBe(2);
  });

  it("adjacency is symmetric", () => {
    for (let i = 0; i < ADJ.length; i++) {
      for (const j of ADJ[i]!) {
        expect(ADJ[j]!).toContain(i);
        expect(isAdjacent(i, j)).toBe(true);
        expect(isAdjacent(j, i)).toBe(true);
      }
    }
  });

  it("Alaska connects to Kamchatka (sea route)", () => {
    const alaska = TERRITORIES.findIndex(t => t.name === "Alaska");
    const kam = TERRITORIES.findIndex(t => t.name === "Kamchatka");
    expect(isAdjacent(alaska, kam)).toBe(true);
  });

  it("Greenland connects to Iceland", () => {
    const grn = TERRITORIES.findIndex(t => t.name === "Greenland");
    const ice = TERRITORIES.findIndex(t => t.name === "Iceland");
    expect(isAdjacent(grn, ice)).toBe(true);
  });
});

describe("risk-full initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(12345, S);
    const b = initialState(12345, S);
    expect(a.owner).toEqual(b.owner);
    expect(a.armies).toEqual(b.armies);
    expect(a.reserve).toBe(b.reserve);
  });

  it("different seeds produce different distributions (high probability)", () => {
    const a = initialState(1, S);
    const b = initialState(2, S);
    expect(a.owner).not.toEqual(b.owner);
  });

  it("splits the map evenly between player and CPU", () => {
    const s = initialState(7, S);
    const p = s.owner.filter(o => o === "p").length;
    const c = s.owner.filter(o => o === "c").length;
    expect(Math.abs(p - c)).toBeLessThanOrEqual(1);
    expect(p + c).toBe(42);
  });

  it("places startingArmies on each side (40 by default)", () => {
    const s = initialState(1, S);
    const pArmies = s.armies.reduce((sum, a, i) => sum + (s.owner[i] === "p" ? a : 0), 0);
    const cArmies = s.armies.reduce((sum, a, i) => sum + (s.owner[i] === "c" ? a : 0), 0);
    expect(pArmies).toBe(40);
    expect(cArmies).toBe(40);
  });

  it("starts in reinforce phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("reinforce");
    expect(isTerminal(s)).toBeNull();
  });

  it("starting reserve = max(3, owned/3)", () => {
    const s = initialState(1, S);
    const owned = s.owner.filter(o => o === "p").length;
    expect(s.reserve).toBe(Math.max(3, Math.floor(owned / 3)));
  });
});

describe("risk-full card sets", () => {
  it("escalating values: 4, 6, 8, 10, 12, 15, then +5 each", () => {
    expect(cardSetValue(0)).toBe(4);
    expect(cardSetValue(1)).toBe(6);
    expect(cardSetValue(2)).toBe(8);
    expect(cardSetValue(3)).toBe(10);
    expect(cardSetValue(4)).toBe(12);
    expect(cardSetValue(5)).toBe(15);
    expect(cardSetValue(6)).toBe(20);
    expect(cardSetValue(7)).toBe(25);
  });

  it("validates three-of-a-kind sets", () => {
    const set: Card[] = [
      { kind: "infantry", terr: 0 },
      { kind: "infantry", terr: 1 },
      { kind: "infantry", terr: 2 },
    ];
    expect(isValidSet(set)).toBe(true);
  });

  it("validates one-of-each sets", () => {
    const set: Card[] = [
      { kind: "infantry", terr: 0 },
      { kind: "cavalry",  terr: 1 },
      { kind: "artillery", terr: 2 },
    ];
    expect(isValidSet(set)).toBe(true);
  });

  it("validates wild-card sets", () => {
    const set: Card[] = [
      { kind: "infantry", terr: 0 },
      { kind: "cavalry",  terr: 1 },
      { kind: "wild",     terr: -1 },
    ];
    expect(isValidSet(set)).toBe(true);
  });

  it("rejects two-pair non-sets", () => {
    const set: Card[] = [
      { kind: "infantry", terr: 0 },
      { kind: "infantry", terr: 1 },
      { kind: "cavalry",  terr: 2 },
    ];
    expect(isValidSet(set)).toBe(false);
  });

  it("findValidSet locates a set when one exists", () => {
    const hand: Card[] = [
      { kind: "infantry", terr: 0 },
      { kind: "cavalry",  terr: 1 },
      { kind: "infantry", terr: 2 },
      { kind: "artillery", terr: 3 },
    ];
    const idx = findValidSet(hand);
    expect(idx).not.toBeNull();
    if (idx) {
      const cards = idx.map(i => hand[i]!);
      expect(isValidSet(cards)).toBe(true);
    }
  });
});

describe("risk-full continent bonus", () => {
  it("gives bonus when a player owns all of a continent", () => {
    let s = initialState(1, S);
    // Force player to own all of Australia (38..41)
    const owner = s.owner.slice();
    for (let i = 38; i <= 41; i++) owner[i] = "p";
    s = { ...s, owner };
    const bonus = continentBonus(s, "p");
    expect(bonus).toBeGreaterThanOrEqual(2);  // Australia is +2
  });

  it("no bonus if even one territory is enemy-held", () => {
    let s = initialState(1, S);
    const owner = s.owner.slice();
    for (let i = 38; i <= 41; i++) owner[i] = "p";
    owner[38] = "c";
    s = { ...s, owner };
    // reset all others to avoid accidental other-continent bonuses
    const cleanOwner = new Array<typeof owner[number]>(42).fill("c");
    for (let i = 39; i <= 41; i++) cleanOwner[i] = "p";
    s = { ...s, owner: cleanOwner };
    expect(continentBonus(s, "p")).toBe(0);
  });

  it("reinforcementsFor includes continent bonus", () => {
    let s = initialState(1, S);
    const owner = new Array<typeof s.owner[number]>(42).fill("c");
    for (let i = 38; i <= 41; i++) owner[i] = "p";
    s = { ...s, owner };
    const r = reinforcementsFor(s, "p");
    // owned = 4 → max(3, 1) = 3, plus Australia +2 = 5
    expect(r).toBe(5);
  });
});

describe("risk-full reducer — reinforce", () => {
  it("placing on owned territory increments army and decrements reserve", () => {
    let s = initialState(42, S);
    const own = s.owner.findIndex(o => o === "p");
    const before = s.armies[own]!;
    const startRes = s.reserve;
    s = reducer(s, { type: "placeOn", idx: own });
    expect(s.armies[own]).toBe(before + 1);
    expect(s.reserve).toBe(startRes - 1);
  });

  it("rejects placing on enemy territory (returns same state)", () => {
    let s = initialState(42, S);
    const cpu = s.owner.findIndex(o => o === "c");
    const result = reducer(s, { type: "placeOn", idx: cpu });
    expect(result).toBe(s);  // reference-equal
  });

  it("transitions to attack-from once reserve is exhausted", () => {
    let s = initialState(42, S);
    const own = s.owner.findIndex(o => o === "p");
    while (s.reserve > 0) s = reducer(s, { type: "placeOn", idx: own });
    expect(s.phase).toBe("attack-from");
  });

  it("endReinforce auto-places remaining and advances", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "endReinforce" });
    expect(s.reserve).toBe(0);
    expect(s.phase).toBe("attack-from");
  });
});

describe("risk-full reducer — attack mechanics", () => {
  it("rollAttack produces valid army losses summing to ≤ 2", () => {
    let s = initialState(123, S);
    s = reducer(s, { type: "endReinforce" });
    // Find a player territory with ≥2 armies that has an adjacent enemy.
    const fromIdx = s.owner.findIndex((o, i) =>
      o === "p" && s.armies[i]! >= 2 && ADJ[i]!.some(n => s.owner[n] === "c"));
    if (fromIdx < 0) return;  // very rare seed — skip
    s = reducer(s, { type: "select", idx: fromIdx });
    expect(s.phase).toBe("attack-to");
    const tgt = ADJ[fromIdx]!.find(n => s.owner[n] === "c")!;
    const before = s.armies[fromIdx]! + s.armies[tgt]!;
    s = reducer(s, { type: "select", idx: tgt });
    expect(s.phase).toBe("attack-roll");
    s = reducer(s, { type: "rollAttack" });
    const after = s.armies[fromIdx]! + s.armies[tgt]!;
    // Loss is at most 2 per round (or 1 if defender had only 1 army).
    expect(before - after).toBeLessThanOrEqual(2);
    expect(s.attackerDice.length).toBeGreaterThan(0);
    expect(s.defenderDice.length).toBeGreaterThan(0);
  });

  it("rejects non-adjacent attack target (stays in attack-to)", () => {
    let s = initialState(99, S);
    s = reducer(s, { type: "endReinforce" });
    const fromIdx = s.owner.findIndex((o, i) =>
      o === "p" && s.armies[i]! >= 2 && ADJ[i]!.some(n => s.owner[n] === "c"));
    if (fromIdx < 0) return;
    s = reducer(s, { type: "select", idx: fromIdx });
    const nonAdj = s.owner.findIndex((o, i) => o === "c" && !ADJ[fromIdx]!.includes(i));
    if (nonAdj < 0) return;
    s = reducer(s, { type: "select", idx: nonAdj });
    expect(s.phase).toBe("attack-to");
    expect(s.target).toBeNull();
  });

  it("dice are sorted descending", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "endReinforce" });
    const fromIdx = s.owner.findIndex((o, i) =>
      o === "p" && s.armies[i]! >= 2 && ADJ[i]!.some(n => s.owner[n] === "c"));
    if (fromIdx < 0) return;
    const tgt = ADJ[fromIdx]!.find(n => s.owner[n] === "c")!;
    s = reducer(s, { type: "select", idx: fromIdx });
    s = reducer(s, { type: "select", idx: tgt });
    s = reducer(s, { type: "rollAttack" });
    for (let i = 1; i < s.attackerDice.length; i++) {
      expect(s.attackerDice[i - 1]!).toBeGreaterThanOrEqual(s.attackerDice[i]!);
    }
    for (let i = 1; i < s.defenderDice.length; i++) {
      expect(s.defenderDice[i - 1]!).toBeGreaterThanOrEqual(s.defenderDice[i]!);
    }
  });
});

describe("risk-full reducer — fortify connectivity", () => {
  it("isConnectedFriendly returns true through friendly chain", () => {
    let s = initialState(1, S);
    // Build a chain: territories 0,1,2 owned by player (all adjacent)
    const owner = s.owner.slice();
    owner[0] = "p"; owner[1] = "p"; owner[2] = "p";
    s = { ...s, owner };
    expect(isConnectedFriendly(s, 0, 1)).toBe(true);
    // 0 and 2: 0↔1↔2 chain (NW Territory connects them)
    expect(isConnectedFriendly(s, 0, 2)).toBe(true);
  });

  it("isConnectedFriendly returns false if blocked by enemy", () => {
    let s = initialState(1, S);
    const owner = new Array<typeof s.owner[number]>(42).fill("c");
    owner[0] = "p";
    owner[5] = "p";  // Quebec — not adjacent to Alaska
    s = { ...s, owner };
    expect(isConnectedFriendly(s, 0, 5)).toBe(false);
  });
});

describe("risk-full win conditions", () => {
  it("isTerminal returns null while game in progress", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns a positive score on player victory", () => {
    let s = initialState(1, S);
    const owner = new Array<typeof s.owner[number]>(42).fill("p");
    s = { ...s, owner, phase: "done", message: "Total world domination — VICTORY!" };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns ≥ 0 score on CPU victory", () => {
    let s = initialState(1, S);
    const owner = new Array<typeof s.owner[number]>(42).fill("c");
    s = { ...s, owner, phase: "done", message: "Crimson Empire rules the world. Defeat." };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("score is non-negative", () => {
    const s = initialState(1, S);
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
});

describe("risk-full full play loop", () => {
  it("aggressive play eventually terminates", () => {
    let s = initialState(77, S);
    let safety = 0;
    while (s.phase !== "done" && safety < 2000) {
      safety++;
      const action: RiskFullAction = pickAggressive(s);
      s = reducer(s, action);
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(score(s)).toBeGreaterThanOrEqual(0);
  }, 30_000);
});

function pickAggressive(s: RiskFullState): RiskFullAction {
  if (s.phase === "reinforce") {
    if (s.reserve > 0) {
      const idx = s.owner.findIndex(o => o === "p");
      if (idx >= 0) return { type: "placeOn", idx };
    }
    return { type: "endReinforce" };
  }
  if (s.phase === "attack-from") {
    const myStrong = s.owner.map((o, i) => ({ o, i, a: s.armies[i]! }))
      .filter(x => x.o === "p" && x.a >= 3 && ADJ[x.i]!.some(n => s.owner[n] === "c"))
      .sort((a, b) => b.a - a.a)[0];
    if (myStrong) return { type: "select", idx: myStrong.i };
    return { type: "endAttack" };
  }
  if (s.phase === "attack-to") {
    if (s.selected === null) return { type: "endAttack" };
    const adj = ADJ[s.selected]!;
    const enemy = adj.find(n => s.owner[n] === "c");
    if (enemy !== undefined) return { type: "select", idx: enemy };
    return { type: "endAttack" };
  }
  if (s.phase === "attack-roll") return { type: "rollAttack" };
  if (s.phase === "post-conquest" && s.pendingConquest) {
    return { type: "moveAfterConquest", amount: s.pendingConquest.min };
  }
  if (s.phase === "fortify-from" || s.phase === "fortify-to" || s.phase === "fortify-amount") {
    return { type: "endFortify" };
  }
  if (s.phase === "cpu") return { type: "cpu" };
  return { type: "endReinforce" };
}
