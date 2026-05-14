import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  applyMove,
  canMove,
  checkWinner,
  toAbsMain,
  isSafe,
  YARD,
  HOME_CENTER,
  TRACK_SIZE,
  NUM_PAWNS,
  NUM_PLAYERS,
  ENTRY,
  type LudoFullState,
} from "./state.js";

const SETTINGS = { _dummy: false };

function freshState(seed = 42): LudoFullState {
  return initialState(seed, SETTINGS);
}

describe("ludo-full / initialState", () => {
  it("is deterministic for a given seed", () => {
    const a = initialState(123, SETTINGS);
    const b = initialState(123, SETTINGS);
    expect(a).toEqual(b);
  });

  it("starts with all 16 pawns in their yards", () => {
    const s = freshState();
    expect(s.pawns.length).toBe(NUM_PLAYERS);
    for (let p = 0; p < NUM_PLAYERS; p++) {
      expect(s.pawns[p]!.length).toBe(NUM_PAWNS);
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.die).toBe(0);
    expect(s.sixStreak).toBe(0);
  });

  it("isTerminal is null on a fresh state", () => {
    expect(isTerminal(freshState())).toBeNull();
  });
});

describe("ludo-full / board helpers", () => {
  it("toAbsMain wraps modulo 52 from each entry square", () => {
    expect(toAbsMain(0, 0)).toBe(0);                      // red start
    expect(toAbsMain(1, 0)).toBe(ENTRY[1]);               // blue start
    expect(toAbsMain(2, 50)).toBe((26 + 50) % TRACK_SIZE);
    expect(toAbsMain(0, 51)).toBe(51);
    expect(toAbsMain(0, YARD)).toBeNull();
    expect(toAbsMain(0, TRACK_SIZE)).toBeNull();          // already in home column
    expect(toAbsMain(0, HOME_CENTER)).toBeNull();
  });

  it("identifies the eight safe squares", () => {
    for (const sq of [0, 8, 13, 21, 26, 34, 39, 47]) {
      expect(isSafe(sq)).toBe(true);
    }
    expect(isSafe(1)).toBe(false);
    expect(isSafe(20)).toBe(false);
  });
});

describe("ludo-full / canMove", () => {
  it("requires a 6 to leave the yard", () => {
    const s = freshState();
    expect(canMove(s.pawns, 0, 0, 5)).toBe(false);
    expect(canMove(s.pawns, 0, 0, 6)).toBe(true);
  });

  it("forbids overshooting the home center", () => {
    const s = freshState();
    const board = s.pawns.map((p) => [...p]);
    board[0]![0] = HOME_CENTER - 2; // rel 55
    expect(canMove(board, 0, 0, 2)).toBe(true);   // exact landing
    expect(canMove(board, 0, 0, 3)).toBe(false);  // would overshoot
  });

  it("forbids moving a pawn already at home", () => {
    const s = freshState();
    const board = s.pawns.map((p) => [...p]);
    board[0]![0] = HOME_CENTER;
    expect(canMove(board, 0, 0, 1)).toBe(false);
    expect(canMove(board, 0, 0, 6)).toBe(false);
  });
});

describe("ludo-full / reducer roll action", () => {
  it("rejects roll when not in rolling phase", () => {
    const s = { ...freshState(), phase: "moving" as const, die: 4 };
    const next = reducer(s, { type: "roll" });
    expect(next).toBe(s);
  });

  it("rejects roll when not human turn", () => {
    const s = { ...freshState(), turn: 1 };
    const next = reducer(s, { type: "roll" });
    expect(next).toBe(s);
  });

  it("advances rngSeed and sets die after rolling", () => {
    const s = freshState();
    const next = reducer(s, { type: "roll" });
    expect(next.rngSeed).not.toBe(s.rngSeed);
    expect(next.die).toBeGreaterThanOrEqual(1);
    expect(next.die).toBeLessThanOrEqual(6);
  });
});

describe("ludo-full / reducer move action", () => {
  it("ignores move action while in rolling phase", () => {
    const s = freshState();
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next).toBe(s);
  });

  it("ignores out-of-range pawn indices", () => {
    const s = { ...freshState(), phase: "moving" as const, die: 6 };
    expect(reducer(s, { type: "move", pawn: -1 })).toBe(s);
    expect(reducer(s, { type: "move", pawn: NUM_PAWNS })).toBe(s);
  });

  it("releases a pawn from the yard on a 6", () => {
    const s = { ...freshState(), phase: "moving" as const, die: 6 };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(0);
    // Rolling a 6 grants extra turn — still my turn, back in rolling.
    expect(next.turn).toBe(0);
    expect(next.phase).toBe("rolling");
  });

  it("refuses to release a pawn from the yard without a 6", () => {
    const s = { ...freshState(), phase: "moving" as const, die: 3 };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next).toBe(s);
  });

  it("advances a pawn already on the track", () => {
    const s = freshState();
    const board = s.pawns.map((p) => [...p]);
    board[0]![0] = 10;
    const setup: LudoFullState = { ...s, pawns: board, phase: "moving", die: 4 };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(14);
  });
});

describe("ludo-full / capture mechanics", () => {
  it("sends an opponent pawn to the yard on a non-safe square", () => {
    // Red at rel 5 (abs 5). Blue's rel 's' such that (13 + s) % 52 = 5 => s = (5-13+52)%52 = 44.
    // Red rolls 0… use die=1 -> red lands abs 6 then blue must sit there.
    // Easier: place red at rel 7 die=1 -> abs 8 (safe!) - bad.
    // Place red rel 1 die=1 -> abs 2. Blue at rel ((2-13+52)%52)=41 -> abs (13+41)%52=2 ✓
    const s = freshState();
    const board: number[][] = [
      [1, YARD, YARD, YARD],
      [41, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
    ];
    const setup: LudoFullState = { ...s, pawns: board, phase: "moving", die: 1 };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(2);
    expect(next.pawns[1]![0]).toBe(YARD);
  });

  it("does NOT capture an opponent sitting on a safe square", () => {
    // Safe abs 8 = red rel 8. Blue rel = (8 - 13 + 52) % 52 = 47.
    const board: number[][] = [
      [6, YARD, YARD, YARD],
      [47, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
    ];
    const after = applyMove(board, 0, 0, 2);
    expect(after[0]![0]).toBe(8);
    expect(after[1]![0]).toBe(47); // still on safe square
  });
});

describe("ludo-full / winning", () => {
  it("checkWinner returns null when no one has finished", () => {
    expect(checkWinner(freshState().pawns)).toBeNull();
  });

  it("reducer flags the winner when the last pawn enters home", () => {
    const s = freshState();
    const board: number[][] = [
      [HOME_CENTER - 1, HOME_CENTER, HOME_CENTER, HOME_CENTER],
      [YARD, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
      [YARD, YARD, YARD, YARD],
    ];
    const setup: LudoFullState = { ...s, pawns: board, phase: "moving", die: 1 };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(HOME_CENTER);
    expect(next.winner).toBe(0);
    expect(isTerminal(next)).toEqual({ score: 100 });
  });

  it("isTerminal scores 0 for any CPU win", () => {
    const s = freshState();
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
    expect(isTerminal({ ...s, winner: 2 })).toEqual({ score: 0 });
    expect(isTerminal({ ...s, winner: 3 })).toEqual({ score: 0 });
  });

  it("rejects further moves after the game has ended", () => {
    const ended: LudoFullState = { ...freshState(), winner: 0, phase: "moving", die: 6 };
    const next = reducer(ended, { type: "move", pawn: 0 });
    expect(next).toBe(ended);
    const next2 = reducer(ended, { type: "roll" });
    expect(next2).toBe(ended);
  });
});
