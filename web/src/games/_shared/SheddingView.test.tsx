import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SheddingView } from "./SheddingView.js";
import {
  DEFAULT_SHED,
  shedInitial,
  type SheddingState,
} from "./shedding-engine.js";

describe("SheddingView", () => {
  afterEach(() => cleanup());

  it("renders header with title, stock count, active suit and 'You' / 'CPU' labels", () => {
    const state = shedInitial(42, { ...DEFAULT_SHED });
    render(
      <SheddingView
        state={state}
        settings={{}}
        dispatch={() => {}}
        onGameOver={() => {}}
        prefix="shed"
        title="Crazy Eights"
      />,
    );

    expect(screen.getByText("Crazy Eights")).toBeTruthy();
    expect(screen.getByText(`Stock: ${state.stock.length}`)).toBeTruthy();
    expect(screen.getByText(`Suit: ${state.activeSuit ?? "?"}`)).toBeTruthy();
    expect(screen.getByText(`You (${state.playerHand.length})`)).toBeTruthy();
    expect(screen.getByText(`CPU (${state.botHand.length})`)).toBeTruthy();
    expect(screen.getByText("Your turn.")).toBeTruthy();
    // 'Draw' action button is present during player phase
    expect(screen.getByText("Draw")).toBeTruthy();
  });

  it("dispatches a draw action when the Draw button is clicked", () => {
    const state = shedInitial(7, { ...DEFAULT_SHED });
    const dispatch = vi.fn();
    render(
      <SheddingView
        state={state}
        settings={{}}
        dispatch={dispatch}
        onGameOver={() => {}}
        prefix="shed"
        title="Crazy Eights"
      />,
    );

    fireEvent.click(screen.getByText("Draw"));
    expect(dispatch).toHaveBeenCalledWith({ type: "draw" });
  });

  it("renders end-of-game UI and fires onGameOver with player win score", () => {
    const base = shedInitial(1, { ...DEFAULT_SHED });
    const doneState: SheddingState = {
      ...base,
      phase: "done",
      winner: "player",
      message: "You went out!",
    };
    const onGameOver = vi.fn();
    render(
      <SheddingView
        state={doneState}
        settings={{}}
        dispatch={() => {}}
        onGameOver={onGameOver}
        prefix="shed"
        title="Crazy Eights"
      />,
    );

    expect(screen.getByText("Game over")).toBeTruthy();
    expect(screen.getByText("You win!")).toBeTruthy();
    expect(onGameOver).toHaveBeenCalledWith(100);
  });
});
