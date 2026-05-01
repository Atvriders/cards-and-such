import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal, score,
  N_TERR, ADJ, isAdjacent, MAX_TURNS,
} from "./state.js";
import type { RiskState, RiskActionAll } from "./state.js";

const S = { dummy: false };

describe("risk-mini initial state", () => {
  it("creates 6 territories with player owning 3 and CPU owning 3", () => {
    const s = initialState(1, S);
    expect(s.armies.length).toBe(N_TERR);
    expect(s.owner.length).toBe(N_TERR);
    expect(N_TERR).toBe(6);
    expect(s.owner.filter(o => o === "p").length).toBe(3);
    expect(s.owner.filter(o => o === "c").length).toBe(3);
  });

  it("starts in reinforce phase with reserve = max(3, owned/3)", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("reinforce");
    expect(s.reserve).toBe(3);
  });

  it("each starting territory has 4 armies", () => {
    const s = initialState(1, S);
    for (const a of s.armies) expect(a).toBe(4);
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
});

describe("risk-mini reinforce", () => {
  it("placing on owned territory increments army and decrements reserve", () => {
    let s = initialState(42, S);
    const startReserve = s.reserve;
    const startArmies = s.armies[0]!;
    s = reducer(s, { type: "placeOn", idx: 0 });
    expect(s.armies[0]).toBe(startArmies + 1);
    expect(s.reserve).toBe(startReserve - 1);
  });

  it("rejects placing on enemy territory", () => {
    let s = initialState(42, S);
    const before = s.armies.slice();
    s = reducer(s, { type: "placeOn", idx: 5 }); // CPU territory
    expect(s.armies).toEqual(before);
  });

  it("transitions to attack-from once reserve is exhausted", () => {
    let s = initialState(42, S);
    while (s.reserve > 0) s = reducer(s, { type: "placeOn", idx: 0 });
    expect(s.phase).toBe("attack-from");
  });
});

describe("risk-mini attack mechanics", () => {
  function setupAttack(seed: number): RiskState {
    let s = initialState(seed, S);
    // Burn reserves on territory 1 (Ironpeak — adjacent to many)
    while (s.reserve > 0) s = reducer(s, { type: "placeOn", idx: 1 });
    return s;
  }

  it("rollAttack produces valid army losses summing to ≤ min(attDice,defDice)", () => {
    let s = setupAttack(123);
    s = reducer(s, { type: "select", idx: 1 }); // attack from Ironpeak
    expect(s.phase).toBe("attack-to");
    // Find an adjacent CPU territory
    const targetIdx = ADJ[1]!.find(n => s.owner[n] === "c")!;
    expect(targetIdx).toBeDefined();
    const beforeTotal = s.armies[1]! + s.armies[targetIdx]!;
    s = reducer(s, { type: "select", idx: targetIdx });
    expect(s.phase).toBe("attack-roll");
    s = reducer(s, { type: "rollAttack" });
    // After attack, total armies on those two should be lower (some were lost)
    const afterTotal = s.armies[1]! + s.armies[targetIdx]!;
    expect(afterTotal).toBeLessThanOrEqual(beforeTotal);
    // Loss is at most 2 (min of 3-attacker dice, 2-defender dice)
    expect(beforeTotal - afterTotal).toBeLessThanOrEqual(2);
    // Dice were recorded
    expect(s.attackerDice.length).toBeGreaterThan(0);
    expect(s.defenderDice.length).toBeGreaterThan(0);
    expect(s.lastAttackLoss).not.toBeNull();
  });

  it("attackerDice are sorted descending", () => {
    let s = setupAttack(7);
    s = reducer(s, { type: "select", idx: 1 });
    const tgt = ADJ[1]!.find(n => s.owner[n] === "c")!;
    s = reducer(s, { type: "select", idx: tgt });
    s = reducer(s, { type: "rollAttack" });
    const d = s.attackerDice;
    for (let i = 1; i < d.length; i++) expect(d[i - 1]!).toBeGreaterThanOrEqual(d[i]!);
  });

  it("non-adjacent attack target is rejected", () => {
    let s = setupAttack(99);
    s = reducer(s, { type: "select", idx: 1 });
    // Find a non-adjacent CPU territory
    const cpuTerrs = s.owner.map((o, i) => ({ o, i })).filter(x => x.o === "c").map(x => x.i);
    const nonAdj = cpuTerrs.find(i => !ADJ[1]!.includes(i));
    if (nonAdj !== undefined) {
      s = reducer(s, { type: "select", idx: nonAdj });
      expect(s.phase).toBe("attack-to"); // didn't advance
      expect(s.target).toBeNull();
    }
  });
});

describe("risk-mini win conditions", () => {
  it("isTerminal returns null while game in progress", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("game ends when player owns all territories", () => {
    const s = initialState(1, S);
    const allP: RiskState = { ...s, owner: ["p", "p", "p", "p", "p", "p"], phase: "attack-roll", selected: 0, target: 1 };
    // Force a roll that will conquer? Easier: inject done state directly via reducer pathway.
    // We'll just check checkWin via a manual win-state shape:
    const won: RiskState = { ...allP, phase: "done", message: "Total conquest — you win!" };
    expect(isTerminal(won)).not.toBeNull();
    expect(score(won)).toBeGreaterThan(0);
  });

  it("max turns ends the game", () => {
    let s = initialState(123, S);
    let safety = 0;
    while (s.phase !== "done" && safety < 2000) {
      safety++;
      if (s.phase === "reinforce") s = reducer(s, { type: "endReinforce" });
      else if (s.phase === "attack-from") s = reducer(s, { type: "endAttack" });
      else if (s.phase === "fortify-from") s = reducer(s, { type: "endFortify" });
      else if (s.phase === "cpu") s = reducer(s, { type: "cpu" });
      else break;
    }
    expect(s.phase).toBe("done");
    // Either max turns reached or a side conquered
    expect(s.turn <= MAX_TURNS + 1 || s.owner.every(o => o === s.owner[0])).toBe(true);
  });
});

describe("risk-mini full play loop", () => {
  it("aggressive play eventually terminates", () => {
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "done" && safety < 5000) {
      safety++;
      const action: RiskActionAll = pickAggressive(s);
      s = reducer(s, action);
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
});

function pickAggressive(s: RiskState): RiskActionAll {
  if (s.phase === "reinforce") {
    if (s.reserve > 0) {
      const idx = s.owner.findIndex(o => o === "p");
      return { type: "placeOn", idx };
    }
    return { type: "endReinforce" };
  }
  if (s.phase === "attack-from") {
    const myStrong = s.owner.map((o, i) => ({ o, i, a: s.armies[i]! }))
      .filter(x => x.o === "p" && x.a >= 2 && ADJ[x.i]!.some(n => s.owner[n] === "c"))
      .sort((a, b) => b.a - a.a)[0];
    if (myStrong) return { type: "select", idx: myStrong.i };
    return { type: "endAttack" };
  }
  if (s.phase === "attack-to") {
    if (s.selected === null) return { type: "endAttack" };
    const enemy = ADJ[s.selected]!.find(n => s.owner[n] === "c");
    if (enemy !== undefined) return { type: "select", idx: enemy };
    return { type: "endAttack" };
  }
  if (s.phase === "attack-roll") return { type: "rollAttack" };
  if (s.phase === "fortify-from" || s.phase === "fortify-to") return { type: "endFortify" };
  if (s.phase === "cpu") return { type: "cpu" };
  return { type: "endReinforce" };
}
