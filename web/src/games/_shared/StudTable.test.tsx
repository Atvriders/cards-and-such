import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { StudTable } from "./StudTable.js";
import {
  studDeal,
  studInitialState,
  type StudConfig,
  type StudSeat,
} from "./stud-game.js";

interface S {
  stack: number;
  ante: number;
  smallBet: number;
}

function makeCfg(overrides: Partial<StudConfig<S>> = {}): StudConfig<S> {
  return {
    totalHands: 3,
    startingStack: (s) => s.stack,
    ante: (s) => s.ante,
    smallBet: (s) => s.smallBet,
    schedule: [
      { perPlayer: 2, faces: [false, true] },
      { perPlayer: 1, faces: [true] },
    ],
    judge: (player: StudSeat, cpu: StudSeat) => {
      const p = player.cards[0]!.rank;
      const c = cpu.cards[0]!.rank;
      if (p > c) return { winner: "player", tag: "higher" };
      if (p < c) return { winner: "cpu", tag: "higher" };
      return { winner: "split", tag: "tied" };
    },
    cpuStrength: () => 0.0,
    ...overrides,
  };
}

const SETTINGS: S = { stack: 1000, ante: 10, smallBet: 20 };

describe("StudTable", () => {
  afterEach(() => cleanup());

  it("renders the HUD with hand, street, and pot for an idle (pre-deal) state and shows the Deal button", () => {
    const state = studInitialState(123, SETTINGS, makeCfg());
    render(
      <StudTable
        prefix="stud-"
        state={state}
        totalHands={3}
        smallBet={SETTINGS.smallBet}
        onDeal={() => {}}
        onFold={() => {}}
        onCheck={() => {}}
        onCall={() => {}}
        onRaise={() => {}}
      />,
    );

    expect(screen.getByText("Hand 1/3")).toBeTruthy();
    expect(screen.getByText("Street: 0")).toBeTruthy();
    // "Pot: $0" appears in HUD; "Pot $0" appears in the board.
    expect(screen.getByText("Pot: $0")).toBeTruthy();
    // Idle message from studInitialState.
    expect(screen.getByText("Click Deal to begin.")).toBeTruthy();

    const dealBtn = screen.getByTestId("hint-target-stud-deal");
    expect(dealBtn.textContent).toBe("Deal");
  });

  it("fires onDeal when the Deal button is clicked in an idle state", () => {
    const state = studInitialState(7, SETTINGS, makeCfg());
    const onDeal = vi.fn();
    render(
      <StudTable
        prefix="stud-"
        state={state}
        totalHands={3}
        smallBet={SETTINGS.smallBet}
        onDeal={onDeal}
        onFold={() => {}}
        onCheck={() => {}}
        onCall={() => {}}
        onRaise={() => {}}
      />,
    );

    fireEvent.click(screen.getByTestId("hint-target-stud-deal"));
    expect(onDeal).toHaveBeenCalledTimes(1);
  });

  it("after a deal, shows fold/check/call/raise buttons and labels; raise click forwards an amount via onRaise", () => {
    const cfg = makeCfg();
    const dealt = studDeal(studInitialState(42, SETTINGS, cfg), cfg);
    const onRaise = vi.fn();
    const onFold = vi.fn();
    render(
      <StudTable
        prefix="stud-"
        state={dealt}
        totalHands={3}
        smallBet={SETTINGS.smallBet}
        playerHandLabel="High Card"
        cpuHandLabel="Hidden"
        onDeal={() => {}}
        onFold={onFold}
        onCheck={() => {}}
        onCall={() => {}}
        onRaise={onRaise}
      />,
    );

    // Street advanced; HUD reflects it.
    expect(screen.getByText("Street: 1")).toBeTruthy();
    // Antes posted to pot (HUD shows "Pot: $20").
    expect(screen.getByText("Pot: $20")).toBeTruthy();

    // Hand labels rendered.
    expect(screen.getByText("High Card")).toBeTruthy();
    expect(screen.getByText("Hidden")).toBeTruthy();

    // Action buttons present.
    const fold = screen.getByTestId("hint-target-stud-fold");
    const raise = screen.getByTestId("hint-target-stud-raise");
    expect(fold.textContent).toBe("Fold");
    // Initial raise amount equals smallBet (20).
    expect(raise.textContent).toContain("Raise $20");

    fireEvent.click(raise);
    expect(onRaise).toHaveBeenCalledTimes(1);
    expect(onRaise).toHaveBeenCalledWith(20);

    fireEvent.click(fold);
    expect(onFold).toHaveBeenCalledTimes(1);
  });
});
