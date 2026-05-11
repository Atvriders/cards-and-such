import { describe, it, expect } from "vitest";
import { connect6Plugin } from "./index.js";
import { SIZE } from "./state.js";
import type { Cell, Connect6State } from "./state.js";

const S = {} as never;

describe("connect6 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connect6Plugin.id).toBe("connect6");
    expect(connect6Plugin.title).toBe("Connect 6");
    expect(connect6Plugin.category).toBe("board");
    expect(connect6Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connect6Plugin.description).toBe("string");
    expect(connect6Plugin.description.length).toBeGreaterThan(0);
    expect(connect6Plugin.settings).toBeDefined();
    expect(typeof connect6Plugin.settings).toBe("object");
    expect(typeof connect6Plugin.initialState).toBe("function");
    expect(typeof connect6Plugin.reducer).toBe("function");
    expect(typeof connect6Plugin.isTerminal).toBe("function");
    expect(connect6Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = connect6Plugin.initialState(123, S);
    const b = connect6Plugin.initialState(123, S);
    expect(a.board.length).toBe(SIZE * SIZE);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(0);
    expect(a.stonesLeft).toBe(1);
    expect(a.moveCount).toBe(0);
    expect(a.winner).toBeNull();
    expect(a.rngSeed).toBe(123);
    expect(a.lastPlaced).toEqual([]);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(connect6Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget pointing to the center on a fresh board and null after winner is set", () => {
    expect(typeof connect6Plugin.hint).toBe("function");
    const state = connect6Plugin.initialState(7, S);
    const result = connect6Plugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    const center = Math.floor((SIZE * SIZE) / 2);
    expect(result!.selector).toBe(`[data-testid="cell-${center}"]`);
    expect(result!.pulses).toBe(3);

    // Once a winner is set, hint should bail out and return null.
    const won: Connect6State = { ...state, winner: 0 };
    expect(connect6Plugin.hint!(won)).toBeNull();

    // When the center cell is filled but the board still has empty cells,
    // hint should fall through to the first empty index (here: 0).
    const filledCenter: Cell[] = [...state.board];
    filledCenter[center] = 0;
    const offCenter: Connect6State = { ...state, board: filledCenter };
    const r2 = connect6Plugin.hint!(offCenter);
    expect(r2).not.toBeNull();
    expect(r2!.selector).toBe(`[data-testid="cell-0"]`);

    // When the board is fully occupied and there is no winner yet (turn still 0),
    // hint should reach its final `return null`.
    const full: Connect6State = {
      ...state,
      board: new Array<Cell>(SIZE * SIZE).fill(0),
    };
    expect(connect6Plugin.hint!(full)).toBeNull();
  });
});
