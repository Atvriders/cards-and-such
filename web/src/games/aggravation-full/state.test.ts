import { describe, expect, it } from "vitest";
import {
  initialState, reducer, isTerminal, legalMoves, tryMove, freshMarble,
  BASE, HOME, HOME_BASE, CENTER_BASE, RING_SIZE,
  START_RING, HOME_ENTRY, SHORTCUT_ENTRY,
  NUM_PLAYERS, NUM_MARBLES, HOME_COL_LEN, CENTER_LEN,
  progressOf, _internals,
} from "./state.js";
import type { AggravationFullState, AggravationFullSettings, Marble } from "./state.js";

const SETTINGS: AggravationFullSettings = { _dummy: false };

function emptyBoard(): Marble[][] {
  const rows: Marble[][] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) {
    const row: Marble[] = [];
    for (let i = 0; i < NUM_MARBLES; i++) row.push(freshMarble());
    rows.push(row);
  }
  return rows;
}

function fresh(over: Partial<AggravationFullState> = {}): AggravationFullState {
  const base = initialState(42, SETTINGS);
  return { ...base, ...over };
}

describe("Aggravation (Full) — initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(12345, SETTINGS);
    const b = initialState(12345, SETTINGS);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(JSON.stringify(a.marbles)).toBe(JSON.stringify(b.marbles));
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
  });

  it("starts with 4 players, 4 marbles in BASE, no winner", () => {
    const s = initialState(7, SETTINGS);
    expect(s.marbles.length).toBe(NUM_PLAYERS);
    for (let p = 0; p < NUM_PLAYERS; p++) {
      expect(s.marbles[p]!.length).toBe(NUM_MARBLES);
      for (let i = 0; i < NUM_MARBLES; i++) {
        expect(s.marbles[p]![i]!.pos).toBe(BASE);
      }
    }
    expect(s.winner).toBeNull();
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe(0);
    expect(isTerminal(s)).toBeNull();
  });

  it("HOME_BASE, HOME, CENTER_BASE constants are distinct and in order", () => {
    expect(BASE).toBe(-1);
    expect(HOME).toBeGreaterThan(HOME_BASE);
    expect(HOME_BASE).toBeGreaterThan(CENTER_BASE);
    expect(CENTER_BASE).toBeGreaterThan(RING_SIZE);
  });
});

describe("Aggravation (Full) — tryMove basics", () => {
  it("must roll a 6 to leave BASE; bumps an opponent on the start square", () => {
    const marbles = emptyBoard();
    // Place a Blue (player 1) marble on Red's start square.
    marbles[1]![0] = { pos: START_RING[0]!, centerOwner: -1, centerStep: -1 };
    const not6 = tryMove(marbles, 0, 0, 5);
    expect(not6).toBeNull();
    const onSix = tryMove(marbles, 0, 0, 6);
    expect(onSix).not.toBeNull();
    expect(onSix![0]![0]!.pos).toBe(START_RING[0]);
    expect(onSix![1]![0]!.pos).toBe(BASE); // bumped home
  });

  it("plain ring forward move advances by the die value", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: 10, centerOwner: -1, centerStep: -1 };
    const r = tryMove(marbles, 0, 0, 3);
    expect(r).not.toBeNull();
    expect(r![0]![0]!.pos).toBe(13);
  });

  it("cannot land on your own marble", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: 10, centerOwner: -1, centerStep: -1 };
    marbles[0]![1] = { pos: 13, centerOwner: -1, centerStep: -1 };
    const r = tryMove(marbles, 0, 0, 3);
    expect(r).toBeNull();
  });

  it("crossing your home entry routes onto your home column", () => {
    const marbles = emptyBoard();
    // Red home entry is RING_SIZE-1 = 63. Sit at 62, roll 3 → lands in home col slot 1.
    marbles[0]![0] = { pos: 62, centerOwner: -1, centerStep: -1 };
    const r = tryMove(marbles, 0, 0, 3);
    expect(r).not.toBeNull();
    // 62 → 63 (the entry square, but the rule routes from "at" home entry: we
    // STEP TO 63 then on the next pip we enter the column.
    // Pip 1: cur=62 → cur=63 (still ring).
    // Pip 2 onward: we are on home_entry → enter column with remaining=2 → slot 1.
    expect(r![0]![0]!.pos).toBe(HOME_BASE + 1);
  });

  it("landing exactly on HOME wins for that player", () => {
    const marbles = emptyBoard();
    // Place red 3 marbles at HOME and 1 in safety
    marbles[0]![0] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    marbles[0]![1] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    marbles[0]![2] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    marbles[0]![3] = { pos: HOME_BASE + 2, centerOwner: -1, centerStep: -1 }; // slot 2 (0-indexed)
    // Need to advance 2 more to reach HOME exactly (slot 2 → slot 3 → HOME).
    const r = tryMove(marbles, 0, 3, 2);
    expect(r).not.toBeNull();
    expect(r![0]![3]!.pos).toBe(HOME);
  });

  it("overshooting HOME is illegal", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: HOME_BASE + 3, centerOwner: -1, centerStep: -1 }; // slot 3
    // Slot 3 + 2 would land on slot 5 (>HOME_COL_LEN=4) — should overshoot.
    const r = tryMove(marbles, 0, 0, 2);
    expect(r).toBeNull();
  });
});

describe("Aggravation (Full) — shortcut", () => {
  it("landing exactly on your shortcut entry can enter the cross", () => {
    const marbles = emptyBoard();
    // Red's shortcut entry is at 4. Sit at 1, roll 3.
    marbles[0]![0] = { pos: 1, centerOwner: -1, centerStep: -1 };
    const r = tryMove(marbles, 0, 0, 3, true);
    expect(r).not.toBeNull();
    expect(r![0]![0]!.pos).toBe(CENTER_BASE);
    expect(r![0]![0]!.centerOwner).toBe(0);
    expect(r![0]![0]!.centerStep).toBe(0);
  });

  it("landing NOT exactly on shortcut entry cannot enter (useShortcut ignored)", () => {
    const marbles = emptyBoard();
    // Sit at 2, roll 3 → lands on 5 (not entry).
    marbles[0]![0] = { pos: 2, centerOwner: -1, centerStep: -1 };
    const r = tryMove(marbles, 0, 0, 3, true);
    // tryMove returns a normal forward move (no shortcut), so legal but lands on ring
    expect(r).not.toBeNull();
    expect(r![0]![0]!.pos).toBe(5);
  });

  it("advancing inside the center cross moves along its 5 cells", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: CENTER_BASE, centerOwner: 0, centerStep: 0 };
    const r = tryMove(marbles, 0, 0, 2);
    expect(r).not.toBeNull();
    expect(r![0]![0]!.pos).toBe(CENTER_BASE + 2);
    expect(r![0]![0]!.centerStep).toBe(2);
  });

  it("exiting the cross deposits the marble onto the opposite shortcut exit", () => {
    const marbles = emptyBoard();
    // Step 4 (last center cell, owner=red). +1 should exit at SHORTCUT_EXIT[0].
    marbles[0]![0] = { pos: CENTER_BASE + 4, centerOwner: 0, centerStep: 4 };
    const r = tryMove(marbles, 0, 0, 1);
    expect(r).not.toBeNull();
    // remaining=0 after exit; lands on the exit square.
    // SHORTCUT_EXIT[0] = 36
    expect(r![0]![0]!.pos).toBe(36);
    expect(r![0]![0]!.centerStep).toBe(-1);
  });
});

describe("Aggravation (Full) — reducer & capture", () => {
  it("rolling on player 0's turn logs a roll and advances state", () => {
    const s = fresh();
    const r = reducer(s, { type: "roll" });
    // Either we have a legal move and stay in "moving" phase with the die set,
    // OR we had no legal move and the reducer rolled bots forward — in either
    // case the log should contain entries describing what happened.
    expect(r.log.length).toBeGreaterThan(0);
    // rngSeed should have advanced
    expect(r.rngSeed).not.toBe(s.rngSeed);
  });

  it("ignores actions when winner is set", () => {
    const s = fresh({ winner: 1, phase: "done" });
    expect(reducer(s, { type: "roll" })).toBe(s);
    expect(reducer(s, { type: "move", marbleIdx: 0 })).toBe(s);
    expect(reducer(s, { type: "endTurn" })).toBe(s);
  });

  it("illegal move action returns same state reference", () => {
    // Put player 0 in moving with die=5 and all marbles in BASE.
    // Legal moves should be empty; any move dispatch returns same state.
    const s = fresh({ phase: "moving", die: 5 });
    const out = reducer(s, { type: "move", marbleIdx: 0 });
    expect(out).toBe(s);
  });

  it("capturing an opponent puts that marble back in BASE", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: 5, centerOwner: -1, centerStep: -1 };
    marbles[1]![0] = { pos: 8, centerOwner: -1, centerStep: -1 };
    const s = fresh({ phase: "moving", die: 3, turn: 0, marbles });
    const next = reducer(s, { type: "move", marbleIdx: 0 });
    expect(next.marbles[0]![0]!.pos).toBe(8);
    expect(next.marbles[1]![0]!.pos).toBe(BASE);
  });
});

describe("Aggravation (Full) — winning", () => {
  it("isTerminal returns null when winner is null", () => {
    const s = fresh();
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score>0 when player 0 wins", () => {
    const s = fresh({ winner: 0, phase: "done" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });

  it("isTerminal returns score=0 when a bot wins", () => {
    const s = fresh({ winner: 2, phase: "done" });
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("reducer transitions to 'done' when player 0 completes the race", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    marbles[0]![1] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    marbles[0]![2] = { pos: HOME, centerOwner: -1, centerStep: -1 };
    // Last marble in home col slot 2, needs exact 2 to reach HOME.
    marbles[0]![3] = { pos: HOME_BASE + 2, centerOwner: -1, centerStep: -1 };
    const s = fresh({ phase: "moving", die: 2, turn: 0, marbles });
    const next = reducer(s, { type: "move", marbleIdx: 3 });
    expect(next.winner).toBe(0);
    expect(next.phase).toBe("done");
    const t = isTerminal(next);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });
});

describe("Aggravation (Full) — legal moves and CPU", () => {
  it("legalMoves returns a 'shortcut' alternative when applicable", () => {
    const marbles = emptyBoard();
    marbles[0]![0] = { pos: 1, centerOwner: -1, centerStep: -1 };
    // Die=3, landing on SHORTCUT_ENTRY[0]=4 → two options: stay on ring at 4, or enter center.
    const opts = legalMoves(marbles, 0, 3);
    const shortcutOpt = opts.find(o => o.marbleIdx === 0 && o.useShortcut);
    const ringOpt = opts.find(o => o.marbleIdx === 0 && !o.useShortcut);
    expect(shortcutOpt).toBeDefined();
    expect(ringOpt).toBeDefined();
  });

  it("CPU picker prefers a move that captures an opponent", () => {
    const marbles = emptyBoard();
    marbles[1]![0] = { pos: 5, centerOwner: -1, centerStep: -1 }; // Blue's marble
    marbles[1]![1] = { pos: 10, centerOwner: -1, centerStep: -1 }; // farther along Blue marble
    // Place a Red marble (player 0) on square 7 for Blue to bump if rolling +3 with marble 0 (which is at 5).
    marbles[0]![0] = { pos: 7, centerOwner: -1, centerStep: -1 };
    // Bot 1 rolls 2 → marble 0: 5+2 = 7 (capture), marble 1: 10+2 = 12 (no capture but greater farthest progress).
    const s = fresh({ turn: 1, marbles, die: 2, phase: "moving" });
    const choice = _internals.pickBotMove(s, 1, 2);
    expect(choice).not.toBeNull();
    expect(choice!.captured).toBe(true);
    expect(choice!.marbleIdx).toBe(0);
  });

  it("progressOf reports increasing values as a marble advances", () => {
    const p0Base = progressOf(0, freshMarble());
    const p0Start = progressOf(0, { pos: START_RING[0]!, centerOwner: -1, centerStep: -1 });
    const p0Home = progressOf(0, { pos: HOME, centerOwner: -1, centerStep: -1 });
    expect(p0Base).toBeLessThan(p0Start);
    expect(p0Start).toBeLessThan(p0Home);
  });
});

describe("Aggravation (Full) — constants sanity", () => {
  it("each START_RING entry is unique", () => {
    const set = new Set(START_RING);
    expect(set.size).toBe(NUM_PLAYERS);
  });

  it("each HOME_ENTRY is just before the corresponding start square", () => {
    for (let p = 0; p < NUM_PLAYERS; p++) {
      const expected = (START_RING[p]! - 1 + RING_SIZE) % RING_SIZE;
      expect(HOME_ENTRY[p]).toBe(expected);
    }
  });

  it("HOME_COL_LEN matches the number of home column slots used in tests", () => {
    expect(HOME_COL_LEN).toBe(4);
    expect(CENTER_LEN).toBe(5);
  });

  it("SHORTCUT_ENTRY is 4 squares past START for each player", () => {
    for (let p = 0; p < NUM_PLAYERS; p++) {
      expect(SHORTCUT_ENTRY[p]).toBe((START_RING[p]! + 4) % RING_SIZE);
    }
  });
});
