import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pieceAttrs, pieceLabel } from "./state.js";
import type { QuartoSettings, QuartoState } from "./state.js";

const settings: QuartoSettings = { botStrength: "easy" };

describe("Quarto pieceAttrs", () => {
  it("piece 0 is short, dark, round, hollow", () => {
    const a = pieceAttrs(0);
    expect(a.tall).toBe(false);
    expect(a.light).toBe(false);
    expect(a.square).toBe(false);
    expect(a.solid).toBe(false);
  });

  it("piece 15 is tall, light, square, solid", () => {
    const a = pieceAttrs(15);
    expect(a.tall).toBe(true);
    expect(a.light).toBe(true);
    expect(a.square).toBe(true);
    expect(a.solid).toBe(true);
  });

  it("pieceLabel returns 4-char string", () => {
    expect(pieceLabel(0)).toHaveLength(4);
    expect(pieceLabel(15)).toHaveLength(4);
  });
});

describe("Quarto initialState", () => {
  it("board starts empty", () => {
    const s = initialState(1, settings);
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("bot has chosen the first piece for player to place", () => {
    const s = initialState(1, settings);
    expect(s.toPlace).not.toBeNull();
    expect(s.phase).toBe("place");
    expect(s.turn).toBe("player");
  });

  it("15 pieces remain after bot chose one", () => {
    const s = initialState(1, settings);
    expect(s.remaining).toHaveLength(15);
    expect(s.remaining).not.toContain(s.toPlace);
  });
});

describe("Quarto reducer", () => {
  it("place puts piece on board", () => {
    const s = initialState(1, settings);
    const piece = s.toPlace!;
    const s2 = reducer(s, { type: "place", cell: 0 });
    expect(s2.board[0]).toBe(piece);
    expect(s2.phase).toBe("choose");
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", cell: 0 });
    // Now in choose phase — must choose first
    const piece = s2.remaining[0]!;
    const s3 = reducer(s2, { type: "choose", piece });
    // After bot places and gives us a piece, we're in place phase again
    const s4 = reducer(s3, { type: "place", cell: 0 }); // cell 0 occupied
    expect(s4.board[0]).toBe(s2.board[0]); // unchanged
  });

  it("choose advances to bot placing and returns place phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "place", cell: 5 });
    expect(s2.phase).toBe("choose");
    const piece = s2.remaining[0]!;
    const s3 = reducer(s2, { type: "choose", piece });
    expect(s3.phase).toBe("place");
  });

  it("winning condition detected after player places", () => {
    // Build a state near a win: row 0 has pieces 0,1,2 all with bit 0 = 0 (hollow)
    // piece 3 also has bit 0 = 0 (hollow) — placing it completes row 0 all hollow
    const base = initialState(1, settings);
    const board = [...base.board];
    board[0] = 0;  // bit pattern 0000 — hollow
    board[1] = 2;  // bit pattern 0010 — hollow
    board[2] = 4;  // bit pattern 0100 — hollow
    // toPlace = 8 (bit pattern 1000 — hollow, tall)
    const s: QuartoState = {
      ...base,
      board,
      toPlace: 8,
      phase: "place",
      remaining: [1, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
    };
    const s2 = reducer(s, { type: "place", cell: 3 }); // complete row 0
    expect(s2.winner).toBe("player");
    expect(s2.gameOver).toBe(true);
  });

  it("restart resets board", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", cell: 0 });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.board.every((c) => c === null)).toBe(true);
    expect(s3.gameOver).toBe(false);
  });
});

describe("Quarto isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns 100 on player win", () => {
    const base = initialState(1, settings);
    const won: QuartoState = { ...base, gameOver: true, winner: "player", winningLine: [0, 1, 2, 3] };
    expect(isTerminal(won)!.score).toBe(100);
  });

  it("returns 0 on bot win", () => {
    const base = initialState(1, settings);
    const lost: QuartoState = { ...base, gameOver: true, winner: "bot", winningLine: [0, 4, 8, 12] };
    expect(isTerminal(lost)!.score).toBe(0);
  });

  it("returns 50 on draw", () => {
    const base = initialState(1, settings);
    const draw: QuartoState = { ...base, gameOver: true, winner: null, winningLine: null };
    expect(isTerminal(draw)!.score).toBe(50);
  });
});
