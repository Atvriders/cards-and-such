import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, PIECES, pieceOrientations, canPlace, BOARD_SIZE } from "./state.js";
import type { BlokusDuoState } from "./state.js";

describe("Blokus Duo", () => {
  it("starts with 21 pieces for each player and empty board", () => {
    const s = initialState(0, {});
    expect(s.remaining[0]).toHaveLength(21);
    expect(s.remaining[1]).toHaveLength(21);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("pieceOrientations returns unique orientations for I2 (2)", () => {
    const piece = PIECES.find((p) => p.name === "I2")!;
    const oris = pieceOrientations(piece);
    expect(oris.length).toBeGreaterThanOrEqual(1);
    // I2 has 2 orientations: horizontal and vertical
    expect(oris.length).toBe(2);
  });

  it("first piece must cover starting cell (4,4) for player 0", () => {
    const s = initialState(0, {});
    const piece = PIECES[0]!; // monomino
    const ori = pieceOrientations(piece)[0]!;
    // Must cover (4,4)
    expect(canPlace(s.board, ori, 4, 4, 0, false)).toBe(true);
    // Should not be valid anywhere else for first move
    expect(canPlace(s.board, ori, 0, 0, 0, false)).toBe(false);
  });

  it("placing first piece removes it from remaining and triggers bot move", () => {
    const s = initialState(42, {});
    // Select monomino, place at starting cell
    const s1 = reducer(s, { type: "selectPiece", pieceId: 0 });
    const s2 = reducer(s1, { type: "placePiece", row: 4, col: 4 });
    // Human's piece should be placed
    expect(s2.board[4 * BOARD_SIZE + 4]).toBe(0);
    // Piece removed from human remaining
    expect(s2.remaining[0]).not.toContain(0);
    // Bot should have placed a piece
    const botPieces = s2.remaining[1].length;
    expect(botPieces).toBeLessThan(21);
  });

  it("canPlace prevents edge-adjacent same-player pieces", () => {
    const s = initialState(0, {});
    // Place monomino at (4,4)
    const s1 = reducer(s, { type: "selectPiece", pieceId: 0 });
    const s2 = reducer(s1, { type: "placePiece", row: 4, col: 4 });

    // Now manually test canPlace: edge-adjacent to (4,4) should be invalid
    const ori = pieceOrientations(PIECES[0]!)[0]!;
    // (4,5) is edge-adjacent to (4,4) — should be invalid for player 0
    const board = s2.board;
    expect(canPlace(board, ori, 4, 5, 0, true)).toBe(false); // edge adjacent
    // (5,5) is corner-adjacent to (4,4) — should be valid (if no other violations)
    expect(canPlace(board, ori, 5, 5, 0, true)).toBe(true);
  });

  it("isTerminal returns null mid-game and correct scores", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    const win: BlokusDuoState = { ...s, winner: 0 };
    expect(isTerminal(win)).toEqual({ score: 100 });
    const loss: BlokusDuoState = { ...s, winner: 1 };
    expect(isTerminal(loss)).toEqual({ score: 0 });
    const draw: BlokusDuoState = { ...s, winner: "draw" };
    expect(isTerminal(draw)).toEqual({ score: 50 });
  });
});
