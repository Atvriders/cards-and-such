import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WelcomeTutorial, DEFAULT_WELCOME_STEPS } from "./Tutorial.js";

/**
 * Smoke coverage for the first-run welcome carousel: 4 steps, dot navigation,
 * keyboard advance/skip, backdrop confirm-on-step-1, and test ids.
 */
describe("WelcomeTutorial", () => {
  beforeEach(() => {
    // Each test gets a fresh DOM; @testing-library handles unmount.
  });

  it("ships with exactly 4 steps (Welcome → Pick → Play → Track stats)", () => {
    expect(DEFAULT_WELCOME_STEPS).toHaveLength(4);
    expect(DEFAULT_WELCOME_STEPS[0]?.title).toMatch(/welcome/i);
    expect(DEFAULT_WELCOME_STEPS[3]?.title).toMatch(/stats/i);
  });

  it("renders step 1 with dots and Next/Back/Skip", () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(<WelcomeTutorial onComplete={onComplete} onSkip={onSkip} />);

    expect(screen.getByTestId("tut-step-1")).toBeTruthy();
    expect(screen.getByTestId("tut-next")).toBeTruthy();
    expect(screen.getByTestId("tut-back")).toBeTruthy();
    expect(screen.getByTestId("tut-skip")).toBeTruthy();
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByTestId(`tut-dot-${i}`)).toBeTruthy();
    }
    // Back is disabled on step 1.
    expect((screen.getByTestId("tut-back") as HTMLButtonElement).disabled).toBe(true);
  });

  it("Next advances; Got it on the last step calls onComplete", () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(<WelcomeTutorial onComplete={onComplete} onSkip={onSkip} />);

    fireEvent.click(screen.getByTestId("tut-next"));
    expect(screen.getByTestId("tut-step-2")).toBeTruthy();
    fireEvent.click(screen.getByTestId("tut-next"));
    expect(screen.getByTestId("tut-step-3")).toBeTruthy();
    fireEvent.click(screen.getByTestId("tut-next"));
    expect(screen.getByTestId("tut-step-4")).toBeTruthy();
    // Got it
    fireEvent.click(screen.getByTestId("tut-next"));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it("Esc skips, Enter advances", () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(<WelcomeTutorial onComplete={onComplete} onSkip={onSkip} />);

    act(() => {
      fireEvent.keyDown(window, { key: "Enter" });
    });
    expect(screen.getByTestId("tut-step-2")).toBeTruthy();

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("dot click jumps to that step", () => {
    render(<WelcomeTutorial onComplete={vi.fn()} onSkip={vi.fn()} />);
    fireEvent.click(screen.getByTestId("tut-dot-3"));
    expect(screen.getByTestId("tut-step-3")).toBeTruthy();
  });

  it("backdrop click on step 1 prompts confirm; later steps skip immediately", () => {
    const onSkip = vi.fn();
    render(<WelcomeTutorial onComplete={vi.fn()} onSkip={onSkip} />);

    // Step 1 → confirm dialog
    fireEvent.click(screen.getByTestId("tut-backdrop"));
    expect(screen.getByTestId("tut-confirm")).toBeTruthy();
    expect(onSkip).not.toHaveBeenCalled();

    // Cancel returns to carousel
    fireEvent.click(screen.getByTestId("tut-confirm-cancel"));
    expect(screen.queryByTestId("tut-confirm")).toBeNull();

    // Advance to step 2 then click backdrop → immediate skip
    fireEvent.click(screen.getByTestId("tut-next"));
    fireEvent.click(screen.getByTestId("tut-backdrop"));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
