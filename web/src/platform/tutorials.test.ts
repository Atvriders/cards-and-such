import { beforeEach, describe, expect, it } from "vitest";
import {
  COACHMARK_KEY,
  TUTORIALS,
  getCoachmarkState,
  hasSeenTutorial,
  hasSeenWelcomeTutorial,
  markTutorialSeen,
  markWelcomeTutorialSeen,
  resetWelcomeTutorial,
  setCoachmarkDone,
  setCoachmarkPending,
  tutorialFor,
} from "./tutorials.js";

const STORAGE_KEY = "cards-tutorial-seen";

describe("tutorials", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tutorialFor returns the matching step list or undefined", () => {
    const klondike = tutorialFor("klondike");
    expect(klondike).toBe(TUTORIALS.klondike);
    expect(klondike?.length).toBeGreaterThan(0);
    // Every step has the required shape from TutorialStep.
    for (const step of klondike ?? []) {
      expect(typeof step.title).toBe("string");
      expect(typeof step.text).toBe("string");
      expect(step.title.length).toBeGreaterThan(0);
    }
    expect(tutorialFor("does-not-exist")).toBeUndefined();
  });

  it("markTutorialSeen / hasSeenTutorial persist a flag per game without colliding", () => {
    expect(hasSeenTutorial("klondike")).toBe(false);
    expect(hasSeenTutorial("freecell")).toBe(false);

    markTutorialSeen("klondike");
    expect(hasSeenTutorial("klondike")).toBe(true);
    // Marking one game does not mark another.
    expect(hasSeenTutorial("freecell")).toBe(false);

    // Welcome flag is independent of per-game flags.
    expect(hasSeenWelcomeTutorial()).toBe(false);
    markWelcomeTutorialSeen();
    expect(hasSeenWelcomeTutorial()).toBe(true);
    // Per-game flag still set after welcome flip.
    expect(hasSeenTutorial("klondike")).toBe(true);

    resetWelcomeTutorial();
    expect(hasSeenWelcomeTutorial()).toBe(false);
    // Resetting welcome does not wipe per-game progress.
    expect(hasSeenTutorial("klondike")).toBe(true);

    // Corrupt JSON in storage degrades gracefully to "not seen".
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(hasSeenTutorial("klondike")).toBe(false);
    expect(hasSeenWelcomeTutorial()).toBe(false);
  });

  it("coachmark state machine: unset -> pending -> done", () => {
    expect(getCoachmarkState()).toBe("unset");
    setCoachmarkPending();
    expect(getCoachmarkState()).toBe("pending");
    expect(localStorage.getItem(COACHMARK_KEY)).toBe("pending");
    setCoachmarkDone();
    expect(getCoachmarkState()).toBe("done");
    expect(localStorage.getItem(COACHMARK_KEY)).toBe("done");
    // Unknown raw values normalise back to "unset".
    localStorage.setItem(COACHMARK_KEY, "garbage");
    expect(getCoachmarkState()).toBe("unset");
  });
});
