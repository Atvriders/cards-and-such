import { render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { newDeck } from "../../engines/deck/index.js";
import { pgInitialState, pgDeal, type PGConfig } from "./poker-game.js";
import { PokerTable } from "./PokerTable.js";

interface TestSettings {
  startingStack: number;
  smallBlind: number;
}

const cfg: PGConfig<TestSettings> = {
  totalHands: 3,
  startingStack: (s) => s.startingStack,
  smallBlind: (s) => s.smallBlind,
  holeCount: 2,
  buildDeck: () => newDeck(),
  judge: () => ({ winner: "player", tag: "test" }),
  cpuStrength: () => 0,
};

function makeProps(overrides: Partial<Parameters<typeof PokerTable>[0]> = {}) {
  const state = pgInitialState<TestSettings>(42, { startingStack: 200, smallBlind: 10 }, cfg);
  return {
    prefix: "tt-",
    state,
    totalHands: 3,
    smallBlind: 10,
    onDeal: vi.fn(),
    onFold: vi.fn(),
    onCheck: vi.fn(),
    onCall: vi.fn(),
    onRaise: vi.fn(),
    ...overrides,
  };
}

it("renders initial HUD with hand/phase/pot and Deal button in pre-deal state", () => {
  render(<PokerTable {...makeProps()} />);
  // HUD stats.
  expect(screen.getByText("Hand 1/3")).toBeInTheDocument();
  expect(screen.getByText("Phase: preflop")).toBeInTheDocument();
  // Pot appears in HUD and on the board.
  expect(screen.getAllByText(/Pot \$?0/).length).toBeGreaterThanOrEqual(1);
  // Initial action is a Deal button (handsPlayed === 0).
  const dealBtn = screen.getByTestId("hint-target-tt-deal");
  expect(dealBtn).toBeInTheDocument();
  expect(dealBtn.textContent).toBe("Deal");
});

it("after dealing, renders Fold/Check/Call/Raise buttons and CPU bet display", () => {
  const initial = pgInitialState<TestSettings>(42, { startingStack: 200, smallBlind: 10 }, cfg);
  const dealt = pgDeal(initial, cfg);
  render(<PokerTable {...makeProps({ state: dealt })} />);

  // Action buttons should now be present (no Deal button).
  expect(screen.getByTestId("hint-target-tt-fold")).toBeInTheDocument();
  expect(screen.getByTestId("hint-target-tt-check")).toBeInTheDocument();
  expect(screen.getByTestId("hint-target-tt-call")).toBeInTheDocument();
  expect(screen.getByTestId("hint-target-tt-raise")).toBeInTheDocument();

  // CPU bet (BB=20) shown.
  expect(screen.getByText("bet $20")).toBeInTheDocument();
  // Player bet (SB=10) shown.
  expect(screen.getByText("bet $10")).toBeInTheDocument();
  // Pot total ($30) visible on board.
  expect(screen.getByText("Pot $30")).toBeInTheDocument();
});

it("shows game-over banner when phase is 'done'", () => {
  const initial = pgInitialState<TestSettings>(1, { startingStack: 150, smallBlind: 5 }, cfg);
  const doneState = { ...initial, phase: "done" as const };
  render(<PokerTable {...makeProps({ state: doneState })} />);
  expect(screen.getByText("Final Stack: $150")).toBeInTheDocument();
});
