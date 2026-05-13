import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  calcScore,
  rowScore,
  canCross,
  COLORS,
  ROW_VALUES,
} from "./state.js";
import type { QwixxFullState, Color } from "./state.js";

const settings = { cpuLevel: "normal" as const };

function rolled(seed = 7): QwixxFullState {
  const s = initialState(seed, settings);
  return reducer(s, { type: "roll" });
}

describe("qwixx-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, settings);
    const b = initialState(42, settings);
    expect(a).toEqual(b);
  });

  it("creates 3 players each with empty card and 0 penalties", () => {
    const s = initialState(1, settings);
    expect(s.players).toHaveLength(3);
    for (const p of s.players) {
      expect(p.penalties).toBe(0);
      for (const c of COLORS) {
        expect(p.checked[c]).toHaveLength(11);
        expect(p.checked[c].every((v) => v === false)).toBe(true);
      }
    }
    expect(s.active).toBe(0);
    expect(s.phase).toBe("preRoll");
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(0, settings))).toBeNull();
  });
});

describe("qwixx-full roll", () => {
  it("rolls 6 dice all in 1..6", () => {
    const s = rolled(13);
    expect(s.phase).toBe("rolled");
    expect(s.whiteDice[0]).toBeGreaterThanOrEqual(1);
    expect(s.whiteDice[0]).toBeLessThanOrEqual(6);
    expect(s.whiteDice[1]).toBeGreaterThanOrEqual(1);
    expect(s.whiteDice[1]).toBeLessThanOrEqual(6);
    for (const c of COLORS) {
      expect(s.colorDice[c]).toBeGreaterThanOrEqual(1);
      expect(s.colorDice[c]).toBeLessThanOrEqual(6);
    }
  });

  it("roll is no-op when already rolled (same reference)", () => {
    const s = rolled(13);
    const again = reducer(s, { type: "roll" });
    expect(again).toBe(s);
  });
});

describe("qwixx-full canCross rules", () => {
  it("allows any index when row empty (except final without 5 prior)", () => {
    const row = Array(11).fill(false) as boolean[];
    expect(canCross(row, false, 0)).toBe(true);
    expect(canCross(row, false, 5)).toBe(true);
    // Lock cell requires 5+ prior crosses.
    expect(canCross(row, false, 10)).toBe(false);
  });

  it("disallows going backwards", () => {
    const row = Array(11).fill(false) as boolean[];
    row[4] = true;
    expect(canCross(row, false, 3)).toBe(false);
    expect(canCross(row, false, 5)).toBe(true);
  });

  it("disallows crossing in a locked row", () => {
    const row = Array(11).fill(false) as boolean[];
    expect(canCross(row, true, 2)).toBe(false);
  });

  it("allows lock cell with 5 prior", () => {
    const row = Array(11).fill(false) as boolean[];
    for (let i = 0; i < 5; i++) row[i] = true;
    expect(canCross(row, false, 10)).toBe(true);
  });
});

describe("qwixx-full markWhite", () => {
  it("marks a cell whose value equals whiteSum on human card", () => {
    // Force a known dice configuration by patching state directly.
    const s0 = initialState(0, settings);
    const sR: QwixxFullState = {
      ...s0,
      phase: "rolled",
      whiteDice: [3, 4], // sum 7
      colorDice: { red: 6, yellow: 6, green: 6, blue: 6 },
    };
    // Red row index 5 = value 7
    const after = reducer(sR, { type: "markWhite", player: 0, color: "red", index: 5 });
    const p0 = after.players[0];
    if (!p0) throw new Error("player 0 missing");
    expect(p0.checked.red[5]).toBe(true);
    expect(after.activeMadeWhiteMark).toBe(true);
    expect(after.whiteActed[0]).toBe(true);
  });

  it("rejects a white mark with wrong value (returns same state)", () => {
    const s0: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [3, 4],
      colorDice: { red: 6, yellow: 6, green: 6, blue: 6 },
    };
    const after = reducer(s0, { type: "markWhite", player: 0, color: "red", index: 0 });
    expect(after).toBe(s0);
  });

  it("locks the row when marking rightmost with 5+ priors", () => {
    const s0: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [6, 6], // sum 12 — final for red
      colorDice: { red: 1, yellow: 1, green: 1, blue: 1 },
    };
    const p0 = s0.players[0];
    if (!p0) throw new Error("player 0 missing");
    const filled = p0.checked.red.slice();
    for (let i = 0; i < 5; i++) filled[i] = true;
    const seeded: QwixxFullState = {
      ...s0,
      players: s0.players.map((p, i) =>
        i === 0 ? { ...p, checked: { ...p.checked, red: filled } } : p,
      ),
    };
    const after = reducer(seeded, { type: "markWhite", player: 0, color: "red", index: 10 });
    expect(after.locked.red).toBe(true);
  });
});

describe("qwixx-full markColor", () => {
  it("requires active player", () => {
    const s: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [2, 3],
      colorDice: { red: 4, yellow: 1, green: 1, blue: 1 },
      active: 1, // CPU's turn — markColor by human dispatch should still apply to *active* player; but it's CPU's row. Our reducer only acts on active.
    };
    // Index 4 (red value 6 = white1=2 + red=4)
    const after = reducer(s, { type: "markColor", color: "red", index: 4 });
    // Active is player 1 (CPU); cross goes onto P1's card.
    const p1 = after.players[1];
    if (!p1) throw new Error("p1 missing");
    expect(p1.checked.red[4]).toBe(true);
  });

  it("rejects when activeMadeColorMark already true", () => {
    const s: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [2, 3],
      colorDice: { red: 4, yellow: 1, green: 1, blue: 1 },
      activeMadeColorMark: true,
    };
    const after = reducer(s, { type: "markColor", color: "red", index: 4 });
    expect(after).toBe(s);
  });
});

describe("qwixx-full endTurn / penalty", () => {
  it("end turn with no marks applies a penalty to active player", () => {
    const s: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [1, 1],
      colorDice: { red: 1, yellow: 1, green: 1, blue: 1 },
      active: 0,
    };
    const after = reducer(s, { type: "endTurn" });
    const p0 = after.players[0];
    if (!p0) throw new Error("p0 missing");
    expect(p0.penalties).toBe(1);
    // After end-turn, control passes (or done if game-ending).
    expect(after.active).not.toBe(0);
  });

  it("takePenalty increments and advances the turn", () => {
    const s: QwixxFullState = {
      ...initialState(0, settings),
      phase: "rolled",
      whiteDice: [1, 1],
      colorDice: { red: 1, yellow: 1, green: 1, blue: 1 },
      active: 0,
    };
    const after = reducer(s, { type: "takePenalty" });
    const p0 = after.players[0];
    if (!p0) throw new Error("p0 missing");
    expect(p0.penalties).toBe(1);
    expect(after.phase).toBe("preRoll");
  });

  it("game ends when human reaches 4 penalties", () => {
    let s = initialState(0, settings);
    // Force human to four penalties by manual splicing rather than running rounds.
    const p0 = s.players[0];
    if (!p0) throw new Error("p0 missing");
    s = {
      ...s,
      phase: "rolled",
      whiteDice: [1, 1],
      colorDice: { red: 1, yellow: 1, green: 1, blue: 1 },
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, penalties: 3 } : p,
      ),
      active: 0,
    };
    const after = reducer(s, { type: "takePenalty" });
    expect(after.phase).toBe("done");
    expect(isTerminal(after)).not.toBeNull();
  });
});

describe("qwixx-full scoring", () => {
  it("rowScore matches the official table", () => {
    expect(rowScore(0)).toBe(0);
    expect(rowScore(1)).toBe(1);
    expect(rowScore(2)).toBe(3);
    expect(rowScore(3)).toBe(6);
    expect(rowScore(4)).toBe(10);
    expect(rowScore(5)).toBe(15);
    expect(rowScore(11)).toBe(66);
    expect(rowScore(12)).toBe(78);
  });

  it("calcScore subtracts 5 per penalty and adds row totals", () => {
    let s = initialState(0, settings);
    const p0 = s.players[0];
    if (!p0) throw new Error("p0 missing");
    const reds = p0.checked.red.slice();
    reds[0] = true;
    reds[1] = true;
    reds[2] = true; // 3 crosses → 6 pts
    s = {
      ...s,
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, checked: { ...p.checked, red: reds }, penalties: 1 } : p,
      ),
    };
    // Red row: 3 crosses (no lock) → 6. Penalty -5. Total = 1.
    expect(calcScore(s, 0)).toBe(1);
  });

  it("locking adds the +1 bonus cross to the row score", () => {
    let s = initialState(0, settings);
    const p0 = s.players[0];
    if (!p0) throw new Error("p0 missing");
    const reds = p0.checked.red.slice();
    for (let i = 0; i < 5; i++) reds[i] = true;
    reds[10] = true; // lock cell
    s = {
      ...s,
      locked: { ...s.locked, red: true },
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, checked: { ...p.checked, red: reds } } : p,
      ),
    };
    // 6 crosses + 1 bonus = 7 → 28 pts.
    expect(calcScore(s, 0)).toBe(28);
  });

  it("isTerminal returns null until phase is done", () => {
    const s = initialState(0, settings);
    expect(isTerminal(s)).toBeNull();
    const done: QwixxFullState = { ...s, phase: "done" };
    expect(isTerminal(done)).not.toBeNull();
  });
});

describe("qwixx-full ROW_VALUES sanity", () => {
  it("red and yellow ascend 2..12; green and blue descend 12..2", () => {
    expect(ROW_VALUES.red[0]).toBe(2);
    expect(ROW_VALUES.red[10]).toBe(12);
    expect(ROW_VALUES.yellow[0]).toBe(2);
    expect(ROW_VALUES.yellow[10]).toBe(12);
    expect(ROW_VALUES.green[0]).toBe(12);
    expect(ROW_VALUES.green[10]).toBe(2);
    expect(ROW_VALUES.blue[0]).toBe(12);
    expect(ROW_VALUES.blue[10]).toBe(2);
  });

  it("each color row has 11 values", () => {
    for (const c of COLORS as readonly Color[]) {
      expect(ROW_VALUES[c]).toHaveLength(11);
    }
  });
});
