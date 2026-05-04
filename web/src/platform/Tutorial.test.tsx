import { describe, expect, it, vi, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WelcomeTutorial, DEFAULT_WELCOME_STEPS } from "./Tutorial.js";
import { hasSeenWelcomeTutorial, markWelcomeTutorialSeen } from "./tutorials.js";

// SettingsPage transitively imports the platform sounds module which boots
// Web Audio in jsdom; mock it so the page mounts cleanly inside this suite.
vi.mock("./sounds.js", async () => {
  const actual = await vi.importActual<typeof import("./sounds.js")>(
    "./sounds.js",
  );
  return { ...actual, playSound: vi.fn() };
});

import SettingsPage from "../pages/SettingsPage.js";

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

  // --------------------------------------------------------------------
  // ArrowRight / ArrowLeft drive the carousel without touching the mouse,
  // mirroring Enter (advance) and the Back button. Logic lives in
  // Tutorial.tsx; this guards the keyboard contract from regressing.
  // --------------------------------------------------------------------
  it("ArrowRight advances and ArrowLeft goes back", () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(<WelcomeTutorial onComplete={onComplete} onSkip={onSkip} />);

    expect(screen.getByTestId("tut-step-1")).toBeTruthy();

    // Two Right presses → step 3.
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
    });
    expect(screen.getByTestId("tut-step-2")).toBeTruthy();
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
    });
    expect(screen.getByTestId("tut-step-3")).toBeTruthy();

    // One Left press → back to step 2.
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowLeft" });
    });
    expect(screen.getByTestId("tut-step-2")).toBeTruthy();

    // Arrows must not complete or skip the carousel on their own.
    expect(onComplete).not.toHaveBeenCalled();
    expect(onSkip).not.toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------
// Settings → "Show coachmarks" reset clears `cards-tutorial-seen` and
// re-shows the welcome tutorial. SettingsPage is rendered behind a
// MemoryRouter (it uses <Link>); we then click the production
// `settings-show-coachmarks` button and assert the storage + custom-event
// contract that AppShell relies on to re-open the carousel.
// ----------------------------------------------------------------------
describe("Settings → Show coachmarks reset", () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom does not implement matchMedia. SettingsPage probes it during
    // mount for its mobile-accordion check, so stub a desktop response.
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  // SettingsPage is ~1.5k LOC with a deep transitive graph (themes, sounds,
  // userdata, leaderboard, etc.). Mounting it in jsdom under CI load can
  // easily blow past the 5s default `testTimeout` while React commits the
  // initial render — that's the W511 flake. Bump just this test; the
  // smaller WelcomeTutorial cases stay on the default budget so genuine
  // hangs there still surface quickly.
  it(
    "clears cards-tutorial-seen and dispatches the open event",
    async () => {
      // Pre-seed the welcome-seen flag so we can observe it being cleared.
      markWelcomeTutorialSeen();
      expect(hasSeenWelcomeTutorial()).toBe(true);

      // Mirror AppShell's listener so we can assert the open event fires.
      const onOpen = vi.fn();
      window.addEventListener(
        "cards:open-welcome-tutorial",
        onOpen as EventListener,
      );

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByTestId("settings-show-coachmarks"));

      expect(hasSeenWelcomeTutorial()).toBe(false);
      expect(onOpen).toHaveBeenCalledTimes(1);

      window.removeEventListener(
        "cards:open-welcome-tutorial",
        onOpen as EventListener,
      );
    },
    60_000,
  );
});

// ----------------------------------------------------------------------
// W680: dismissing the welcome carousel must persist across a full unmount
// + remount. AppShell gates the carousel on `hasSeenWelcomeTutorial()` at
// initial-render time, so the contract under test is: after clicking Skip,
// the seen-flag is written, and a fresh mount of the same gating wrapper
// no longer renders the carousel. This guards the first-run flow against
// regressions where the flag is read but never written (or vice versa).
// ----------------------------------------------------------------------
describe("WelcomeTutorial dismiss persists across remount (W680)", () => {
  it("Skip writes the seen-flag and a fresh remount no longer renders the carousel", () => {
    // Mirror AppShell's gating: read the seen-flag at mount time, render
    // the carousel only when unseen, and persist on dismiss. This is the
    // exact contract AppShell.tsx implements (see lines 66-73, 1163-1180).
    function FirstRunGate(): JSX.Element | null {
      const [open, setOpen] = useState<boolean>(() => !hasSeenWelcomeTutorial());
      if (!open) return null;
      return (
        <WelcomeTutorial
          onComplete={() => {
            markWelcomeTutorialSeen();
            setOpen(false);
          }}
          onSkip={() => {
            markWelcomeTutorialSeen();
            setOpen(false);
          }}
        />
      );
    }

    // Fresh storage → carousel must appear on first mount.
    localStorage.clear();
    expect(hasSeenWelcomeTutorial()).toBe(false);

    const first = render(<FirstRunGate />);
    expect(first.getByTestId("tut-step-1")).toBeTruthy();

    // Dismiss via Skip — the production dismiss action.
    fireEvent.click(first.getByTestId("tut-skip"));

    // localStorage now records the carousel as seen.
    expect(hasSeenWelcomeTutorial()).toBe(true);
    expect(localStorage.getItem("cards-tutorial-seen")).toContain("__welcome__");

    // Tearing down the tree must not lose the persisted flag.
    first.unmount();
    expect(hasSeenWelcomeTutorial()).toBe(true);

    // Remount: gate reads the persisted flag and skips the carousel.
    const second = render(<FirstRunGate />);
    expect(second.queryByTestId("tut-step-1")).toBeNull();
    expect(second.queryByTestId("tut-skip")).toBeNull();
    second.unmount();
  });
});
