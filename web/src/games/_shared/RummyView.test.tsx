import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { RummyView } from "./RummyView.js";
import { DEFAULT_RUMMY, rummyInitial } from "./rummy-engine.js";

afterEach(() => {
  cleanup();
});

/**
 * Focused render coverage for RummyView. Builds the minimum valid props
 * via the real `rummyInitial` factory so the view sees a realistic state
 * (10-card hands, 1-card discard pile, "player-draw" phase) — no hand-
 * forged mocks of RummyState shape.
 */
it("renders the header, status row, and knock button for an initial rummy deal", () => {
  const state = rummyInitial(12345, { ...DEFAULT_RUMMY });
  render(
    <RummyView
      state={state}
      settings={{}}
      dispatch={() => {}}
      onGameOver={() => {}}
      prefix="gin"
      title="Gin Rummy"
    />,
  );

  // Title from props is in the header.
  expect(screen.getByText("Gin Rummy")).toBeTruthy();
  // Phase from the initial state.
  expect(screen.getByText(/Phase:\s*player-draw/)).toBeTruthy();
  // Stock count reflects 52 - 20 - 1 = 31.
  expect(screen.getByText(/Stock:\s*31/)).toBeTruthy();
  // Status message from rummyInitial.
  expect(screen.getByText(/Your turn — draw from stock or discard\./)).toBeTruthy();
  // Knock button is present even when not enabled.
  const knock = screen.getByTestId("hint-target-rummy-knock") as HTMLButtonElement;
  expect(knock.tagName).toBe("BUTTON");
  // During player-draw phase the knock gate is closed.
  expect(knock.disabled).toBe(true);
});

it("renders one DOM node per player card and exposes the stock / discard hint targets", () => {
  const state = rummyInitial(12345, { ...DEFAULT_RUMMY });
  render(
    <RummyView
      state={state}
      settings={{}}
      dispatch={() => {}}
      onGameOver={() => {}}
      prefix="gin"
      title="Gin Rummy"
    />,
  );

  // One hint-target wrapper per card in the player hand.
  for (let i = 0; i < state.playerHand.length; i++) {
    expect(screen.getByTestId(`hint-target-rummy-card-${i}`)).toBeTruthy();
  }
  // The two piles render their own hint targets used by the Hint button.
  expect(screen.getByTestId("hint-target-rummy-stock")).toBeTruthy();
  expect(screen.getByTestId("hint-target-rummy-discard")).toBeTruthy();
});
