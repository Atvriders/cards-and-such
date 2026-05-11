import { describe, it, expect } from "vitest";
import { chessEndgameKqkPlugin } from "./index.js";
import { PUZZLES } from "./state.js";
import type { PuzzleState } from "./state.js";

const S = {} as never;

describe("chess-endgame-kqk plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chessEndgameKqkPlugin.id).toBe("chess-endgame-kqk");
    expect(chessEndgameKqkPlugin.title).toBe("Queen vs King");
    expect(chessEndgameKqkPlugin.category).toBe("board");
    expect(chessEndgameKqkPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chessEndgameKqkPlugin.description).toBe("string");
    expect(chessEndgameKqkPlugin.description.length).toBeGreaterThan(0);
    expect(chessEndgameKqkPlugin.settings).toBeDefined();
    expect(typeof chessEndgameKqkPlugin.settings).toBe("object");
    expect(typeof chessEndgameKqkPlugin.initialState).toBe("function");
    expect(typeof chessEndgameKqkPlugin.reducer).toBe("function");
    expect(typeof chessEndgameKqkPlugin.isTerminal).toBe("function");
    expect(chessEndgameKqkPlugin.component).toBeDefined();
  });

  it("initialState is deterministic and isTerminal is null on a fresh puzzle", () => {
    const a = chessEndgameKqkPlugin.initialState(42, S) as PuzzleState;
    const b = chessEndgameKqkPlugin.initialState(99, S) as PuzzleState;
    expect(a.puzzleIndex).toBe(0);
    expect(b.puzzleIndex).toBe(0);
    expect(a.status).toBe("playing");
    expect(a.selected).toBeNull();
    expect(a.puzzle).toEqual(PUZZLES[0]);
    // Board contents identical between fresh seeds (state is seed-independent).
    expect(a.board).toEqual(b.board);
    expect(chessEndgameKqkPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the run is complete", () => {
    expect(typeof chessEndgameKqkPlugin.hint).toBe("function");
    const state = chessEndgameKqkPlugin.initialState(1, S) as PuzzleState;
    const playing = chessEndgameKqkPlugin.hint!(state);
    expect(playing).not.toBeNull();
    expect(typeof playing!.selector).toBe("string");
    expect(playing!.selector.length).toBeGreaterThan(0);
    expect(playing!.selector).toBe(".cp-btn");
    if (playing!.pulses !== undefined) {
      expect(typeof playing!.pulses).toBe("number");
      expect(playing!.pulses).toBeGreaterThan(0);
    }

    // Marking the run complete via a known sentinel makes hint() fall through to null.
    const finishedForHint = { ...state, complete: true } as unknown as PuzzleState;
    expect(chessEndgameKqkPlugin.hint!(finishedForHint)).toBeNull();
    // And isTerminal flips to a terminal result once status === "complete".
    const finishedForTerminal: PuzzleState = { ...state, status: "complete" };
    const terminal = chessEndgameKqkPlugin.isTerminal!(finishedForTerminal);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(1);
  });
});
