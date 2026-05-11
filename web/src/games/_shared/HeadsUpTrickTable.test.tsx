import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick, type HuTrickState, type HuTrickAction } from "./heads-up-trick.js";
import { HeadsUpTrickTable } from "./HeadsUpTrickTable.js";

const ALL_RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function makeState(): HuTrickState {
  const game = makeHuTrick({
    ranks: ALL_RANKS,
    perHand: 5,
    hasTrump: true,
    trumpFromStock: true,
    pointsPerTrick: 1,
  });
  return game.initialState(42);
}

function makeIsTerminal() {
  return (s: HuTrickState): { score: number } | null =>
    s.phase === "done" ? { score: 50 } : null;
}

describe("HeadsUpTrickTable", () => {
  it("renders header with scores, trump, stock and the optional title", () => {
    const state = makeState();
    const { container } = render(
      <HeadsUpTrickTable
        state={state}
        dispatch={() => undefined}
        onGameOver={() => undefined}
        isTerminal={makeIsTerminal()}
        prefix="test"
        title="Test Game"
      />,
    );

    expect(screen.getByText("Test Game")).toBeInTheDocument();
    expect(screen.getByText(/You: 0 pts \(0 tricks\)/)).toBeInTheDocument();
    expect(screen.getByText(/CPU: 0 pts \(0 tricks\)/)).toBeInTheDocument();
    // Trump shown in the header (scope to header to avoid Card glyph collisions).
    const header = container.querySelector(".test-header");
    expect(header).not.toBeNull();
    expect(header!.textContent).toContain(`Trump: ${state.trump}`);
    expect(header!.textContent).toContain(`Stock: ${state.stock.length}`);
    // Empty trick placeholder.
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders hint-target wrappers for each of the player's cards and a back tile per CPU card", () => {
    const state = makeState();
    const { container } = render(
      <HeadsUpTrickTable
        state={state}
        dispatch={() => undefined}
        onGameOver={() => undefined}
        isTerminal={makeIsTerminal()}
        prefix="test"
      />,
    );

    for (const card of state.hands[0]!) {
      expect(screen.getByTestId(`hint-target-test-${card.id}`)).toBeInTheDocument();
    }
    expect(container.querySelectorAll(".test-back").length).toBe(state.hands[1]!.length);
    // No title element when title prop omitted.
    expect(container.querySelector(".test-title")).toBeNull();
  });

  it("calls onGameOver with the terminal score when isTerminal returns one", () => {
    const state = { ...makeState(), phase: "done" as const, message: "Done!" };
    const onGameOver = vi.fn();
    const { container } = render(
      <HeadsUpTrickTable
        state={state}
        dispatch={() => undefined}
        onGameOver={onGameOver}
        isTerminal={() => ({ score: 77 })}
        prefix="test"
      />,
    );

    expect(onGameOver).toHaveBeenCalledWith(77);
    // Done branch renders the result block with the "Hand Complete" header.
    expect(screen.getByRole("heading", { name: "Hand Complete" })).toBeInTheDocument();
    const result = container.querySelector(".test-result");
    expect(result).not.toBeNull();
    expect(result!.textContent).toContain("Done!");
  });
});
