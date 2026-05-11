import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DeductionView } from "./DeductionView.js";
import {
  deductionInitial,
  deductionSubmit,
  type DeductionConfig,
} from "./deduction-engine.js";

const cfg: DeductionConfig = {
  mode: "exact",
  answerLength: 4,
  poolSize: 6,
  allowRepeats: false,
  maxGuesses: 3,
  symbolLabels: ["A", "B", "C", "D", "E", "F"],
  scenarioLabel: "Mystery Hunt",
  scenarioEmoji: "🔎",
};

describe("DeductionView", () => {
  afterEach(() => cleanup());

  it("renders header, scenario, round counter, and submit button in guess phase", () => {
    const state = deductionInitial(42, cfg);
    render(
      <DeductionView
        prefix="deduction"
        cfg={cfg}
        state={state}
        onSet={() => {}}
        onSubmit={() => {}}
        onGameOver={() => {}}
        scoreFn={() => null}
        intro="Find the code"
      />,
    );

    // scenario header
    expect(screen.getByText("Mystery Hunt")).toBeTruthy();
    // round counter 0/3
    expect(screen.getByText("0/3")).toBeTruthy();
    // intro rendered
    expect(screen.getByText("Find the code")).toBeTruthy();
    // submit button (by testid)
    const submit = screen.getByTestId("hint-target-deduction-submit");
    expect(submit.textContent).toBe("Submit Guess");
    // 4 slots present
    for (let i = 0; i < cfg.answerLength; i++) {
      expect(screen.getByTestId(`hint-target-deduction-slot-${i}`)).toBeTruthy();
    }
  });

  it("invokes onSet when a slot button is clicked and onSubmit when submit is pressed", () => {
    const state = deductionInitial(42, cfg);
    const onSet = vi.fn();
    const onSubmit = vi.fn();
    render(
      <DeductionView
        prefix="deduction"
        cfg={cfg}
        state={state}
        onSet={onSet}
        onSubmit={onSubmit}
        onGameOver={() => {}}
        scoreFn={() => null}
      />,
    );

    fireEvent.click(screen.getByTestId("hint-target-deduction-slot-0"));
    expect(onSet).toHaveBeenCalledTimes(1);
    // initial current value at 0 => next value should be 1 (mod poolSize)
    expect(onSet).toHaveBeenCalledWith(0, 1);

    fireEvent.click(screen.getByTestId("hint-target-deduction-submit"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders the final 'Solved!' screen and fires onGameOver with the score when state is won", () => {
    // Build a winning state by setting current = answer, then submitting.
    const init = deductionInitial(42, cfg);
    const won = deductionSubmit(
      { ...init, current: init.answer.slice() },
      cfg,
    );
    const onGameOver = vi.fn();
    render(
      <DeductionView
        prefix="deduction"
        cfg={cfg}
        state={won}
        onSet={() => {}}
        onSubmit={() => {}}
        onGameOver={onGameOver}
        scoreFn={() => ({ score: 140, won: true })}
      />,
    );

    expect(screen.getByText("Solved!")).toBeTruthy();
    expect(screen.getByText("140 pts")).toBeTruthy();
    expect(onGameOver).toHaveBeenCalledWith(140);
  });
});
