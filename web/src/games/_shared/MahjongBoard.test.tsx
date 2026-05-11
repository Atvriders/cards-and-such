import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MahjongBoard, makeThemedMahjongBoard } from "./MahjongBoard.js";
import { makeInitialState, type TilePos } from "./mahjongEngine.js";

/** Flat row of 4 tiles; seed 42 yields all-identical faces so any free
 *  pair matches. Outer tiles (id 0, id 3) are free; inner ones are flanked. */
const flatRow: TilePos[] = [
  { row: 0, col: 0, layer: 0 },
  { row: 0, col: 1, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 3, layer: 0 },
];

describe("MahjongBoard", () => {
  it("renders one button per tile with the correct free/blocked classes and info header", () => {
    const state = makeInitialState(flatRow, 42);
    const dispatch = vi.fn();
    const onGameOver = vi.fn();

    render(
      <MahjongBoard
        state={state}
        settings={{}}
        dispatch={dispatch}
        onGameOver={onGameOver}
      />,
    );

    // Header counters show removed/total and move count.
    expect(screen.getByText(/Removed: 0\/4/)).toBeInTheDocument();
    expect(screen.getByText(/Moves: 0/)).toBeInTheDocument();

    // One button per tile, addressable by stable hint test-id.
    for (const tile of state.tiles) {
      const btn = screen.getByTestId(`hint-target-mahjong-tile-${tile.id}`);
      expect(btn.tagName).toBe("BUTTON");
      // Face emoji rendered inside the button.
      expect(btn).toHaveTextContent(tile.face);
    }

    // Outer tiles are free → enabled; inner tiles are flanked → disabled.
    const t0 = screen.getByTestId("hint-target-mahjong-tile-0") as HTMLButtonElement;
    const t1 = screen.getByTestId("hint-target-mahjong-tile-1") as HTMLButtonElement;
    const t2 = screen.getByTestId("hint-target-mahjong-tile-2") as HTMLButtonElement;
    const t3 = screen.getByTestId("hint-target-mahjong-tile-3") as HTMLButtonElement;
    expect(t0.disabled).toBe(false);
    expect(t3.disabled).toBe(false);
    expect(t1.disabled).toBe(true);
    expect(t2.disabled).toBe(true);
    expect(t0.className).toContain("free");
    expect(t1.className).toContain("blocked");

    // No theme prop → only the base shared class is present.
    const root = t0.closest(".mahjong-shared");
    expect(root).not.toBeNull();
    expect(root!.className).not.toContain("mahjong-theme-");
  });

  it("dispatches a select action when a free tile is clicked", () => {
    const state = makeInitialState(flatRow, 42);
    const dispatch = vi.fn();
    const onGameOver = vi.fn();

    render(
      <MahjongBoard
        state={state}
        settings={{}}
        dispatch={dispatch}
        onGameOver={onGameOver}
      />,
    );

    fireEvent.click(screen.getByTestId("hint-target-mahjong-tile-0"));
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "select", id: 0 });

    // onGameOver must not fire while the board is still playable.
    expect(onGameOver).not.toHaveBeenCalled();
  });

  it("applies the themed root class via makeThemedMahjongBoard and fires onGameOver on a won state", () => {
    const Themed = makeThemedMahjongBoard("jade");

    // Build a won terminal state: all tiles removed.
    const base = makeInitialState(flatRow, 42);
    const wonState = {
      ...base,
      tiles: base.tiles.map((t) => ({ ...t, removed: true })),
      removed: base.total,
      won: true,
      moves: 2,
    };

    const onGameOver = vi.fn();
    render(
      <Themed
        state={wonState}
        settings={{}}
        dispatch={vi.fn()}
        onGameOver={onGameOver}
      />,
    );

    // Themed root class is present.
    const themed = document.querySelector(".mahjong-theme-jade");
    expect(themed).not.toBeNull();

    // Winning banner renders the score (10000 - 2*50 = 9900).
    expect(screen.getByText(/You win! Score: 9900/)).toBeInTheDocument();

    // onGameOver invoked exactly once with the terminal score.
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(9900);
  });
});
