import { describe, it, expect } from "vitest";
import { chessBackRankPlugin } from "./index.js";

describe("chessBackRankPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chessBackRankPlugin.id).toBe("chess-back-rank");
    expect(chessBackRankPlugin.title).toBe("Back Rank");
    expect(chessBackRankPlugin.category).toBe("board");
    expect(chessBackRankPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chessBackRankPlugin.description).toBe("string");
    expect(chessBackRankPlugin.description.length).toBeGreaterThan(0);
    expect(typeof (chessBackRankPlugin as any).howToPlay).toBe("string");
    expect(chessBackRankPlugin.settings).toBeDefined();
    expect(typeof chessBackRankPlugin.initialState).toBe("function");
    expect(typeof chessBackRankPlugin.reducer).toBe("function");
    expect(typeof chessBackRankPlugin.isTerminal).toBe("function");
    expect(typeof chessBackRankPlugin.hint).toBe("function");
    expect(chessBackRankPlugin.component).toBeDefined();
  });

  it("initialState is deterministic and isTerminal is null on a fresh state", () => {
    const a = (chessBackRankPlugin.initialState as any)();
    const b = (chessBackRankPlugin.initialState as any)();
    expect(a.puzzleIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.status).toBe("playing");
    expect(typeof a.message).toBe("string");
    expect(a.message.length).toBeGreaterThan(0);
    expect(a.puzzle).toBeDefined();
    expect(typeof a.puzzle.fen).toBe("string");
    expect(a.puzzle.solution).toBeDefined();
    expect(Array.isArray(a.board)).toBe(true);
    expect(a.board.length).toBe(64);
    // Deterministic: two fresh initial states are equal
    expect(b.puzzleIndex).toBe(a.puzzleIndex);
    expect(b.status).toBe(a.status);
    expect(b.message).toBe(a.message);
    expect(b.puzzle.fen).toBe(a.puzzle.fen);
    expect(b.board).toEqual(a.board);
    // Fresh state should not be terminal
    expect((chessBackRankPlugin.isTerminal as any)(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is complete", () => {
    const playing = (chessBackRankPlugin.initialState as any)();
    const target = chessBackRankPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe(".cp-btn");
    expect(target!.pulses).toBe(3);

    // When status is "complete", treat as game done -> hint logic checks several finished flags;
    // setting `complete: true` should make hint return null.
    const completed = { ...playing, complete: true };
    expect(chessBackRankPlugin.hint!(completed)).toBeNull();

    const gameOver = { ...playing, gameOver: true };
    expect(chessBackRankPlugin.hint!(gameOver)).toBeNull();
  });
});
