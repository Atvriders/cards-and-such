import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  getAllLegalMoves,
} from "./state.js";
import type {
  ChessFullClockSettings,
  ChessFullClockState,
} from "./state.js";
import { idx } from "../_chess-core/types.js";

const defaultSettings: ChessFullClockSettings = {
  timeControl: "rapid-15",
  flipBoardForBlack: false,
};

describe("Chess Full Clock initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, defaultSettings);
    const b = initialState(123, defaultSettings);
    expect(a.board).toEqual(b.board);
    expect(a.castling).toEqual(b.castling);
    expect(a.whiteTimeMs).toEqual(b.whiteTimeMs);
    expect(a.blackTimeMs).toEqual(b.blackTimeMs);
  });

  it("isTerminal returns null on fresh state", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("sets clocks to match time control", () => {
    const blitz = initialState(1, {
      ...defaultSettings,
      timeControl: "blitz-5",
    });
    expect(blitz.whiteTimeMs).toBe(5 * 60 * 1000);
    expect(blitz.blackTimeMs).toBe(5 * 60 * 1000);

    const rapid = initialState(1, {
      ...defaultSettings,
      timeControl: "rapid-15",
    });
    expect(rapid.whiteTimeMs).toBe(15 * 60 * 1000);

    const classical = initialState(1, {
      ...defaultSettings,
      timeControl: "classical-30",
    });
    expect(classical.whiteTimeMs).toBe(30 * 60 * 1000);
  });

  it("starts with 20 legal moves for white", () => {
    const s = initialState(1, defaultSettings);
    expect(getAllLegalMoves(s).length).toBe(20);
  });
});

describe("Chess Full Clock reducer — moves", () => {
  it("applies a legal move and appends a SAN entry to pgn", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, {
      type: "move",
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
    });
    expect(next.pgn.length).toBeGreaterThanOrEqual(1);
    expect(next.pgn[0]).toBe("e4");
    // bot replied — so we should have an even number of plies and turn === white
    expect(next.turn).toBe("white");
    expect(next.lastMove).not.toBeNull();
  });

  it("ignores an illegal move (returns same reference)", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, {
      type: "move",
      // bishop on c1 can't go to c3 through its own pawn
      from: { row: 7, col: 2 },
      to: { row: 5, col: 2 },
    });
    expect(next).toBe(s);
  });

  it("select action highlights a white piece", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, { type: "select", coord: { row: 6, col: 4 } });
    expect(next.selected).toEqual({ row: 6, col: 4 });
  });
});

describe("Chess Full Clock reducer — clock", () => {
  it("decrements the side-to-move's clock on tick", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, { type: "tick", deltaMs: 1000 });
    expect(next.whiteTimeMs).toBe(s.whiteTimeMs - 1000);
    expect(next.blackTimeMs).toBe(s.blackTimeMs);
  });

  it("ignores zero or negative deltas", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick", deltaMs: 0 })).toBe(s);
    expect(reducer(s, { type: "tick", deltaMs: -5 })).toBe(s);
  });

  it("ends the game on white timeout", () => {
    const s = initialState(1, {
      ...defaultSettings,
      timeControl: "blitz-5",
    });
    // tick down to zero
    const huge = s.whiteTimeMs + 1000;
    const next = reducer(s, { type: "tick", deltaMs: huge });
    expect(next.result).toBe("white-timeout");
    const t = isTerminal(next);
    expect(t).not.toBeNull();
    // White timeout = player loss
    expect(t!.score).toBe(0);
  });
});

describe("Chess Full Clock reducer — draw / resign", () => {
  it("resign by the player ends the game", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, { type: "resign" });
    const t = isTerminal(next);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(0);
  });

  it("offering a draw on the opening position sets an offer (bot declines opening)", () => {
    const s = initialState(1, defaultSettings);
    const next = reducer(s, { type: "offer-draw" });
    // Opening position is even, so bot keeps playing — offer is recorded but
    // either drawOfferedBy is set (decline) or result is draw-agreed if eval favors black.
    // Either way the state changed.
    expect(next).not.toBe(s);
  });

  it("ignores actions after game ends", () => {
    let s: ChessFullClockState = initialState(1, defaultSettings);
    s = reducer(s, { type: "resign" });
    const after = reducer(s, {
      type: "move",
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
    });
    expect(after).toBe(s);
  });
});

describe("Chess Full Clock isTerminal", () => {
  it("returns null until the game ends", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns a score of 100 for player win (white-checkmate)", () => {
    // Force the result by direct manipulation (covers the score mapping).
    const s = initialState(1, defaultSettings);
    const won = { ...s, result: "white-checkmate" as const };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("returns 50 for any draw type", () => {
    const s = initialState(1, defaultSettings);
    for (const r of [
      "draw-stalemate",
      "draw-50move",
      "draw-repetition",
      "draw-material",
      "draw-agreed",
    ] as const) {
      expect(isTerminal({ ...s, result: r })).toEqual({ score: 50 });
    }
  });

  it("starting position has both kings present", () => {
    const s = initialState(1, defaultSettings);
    expect(s.board[idx(7, 4)]?.type).toBe("king");
    expect(s.board[idx(0, 4)]?.type).toBe("king");
  });
});
