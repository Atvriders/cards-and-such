import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DualNBackState } from "./state.js";

const n1 = { n: "1" as const };
const n2 = { n: "2" as const };

describe("DualNBack initialState", () => {
  it("starts idle with n from settings", () => {
    const s = initialState(42, n2);
    expect(s.phase).toBe("idle");
    expect(s.n).toBe(2);
    expect(s.stimuli.length).toBe(0);
  });

  it("totalTrials scales with n", () => {
    const s1 = initialState(42, n1);
    const s2 = initialState(42, n2);
    expect(s2.totalTrials).toBeGreaterThan(s1.totalTrials);
  });
});

describe("DualNBack start", () => {
  it("generates stimuli and enters showing phase", () => {
    const s = initialState(42, n1);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.stimuli.length).toBe(s2.totalTrials);
    expect(s2.currentIndex).toBe(0);
  });

  it("grid cells are 0-8", () => {
    const s = reducer(initialState(42, n1), { type: "start" });
    for (const stim of s.stimuli) {
      expect(stim.gridCell).toBeGreaterThanOrEqual(0);
      expect(stim.gridCell).toBeLessThanOrEqual(8);
    }
  });

  it("sound positions are valid letters", () => {
    const s = reducer(initialState(42, n1), { type: "start" });
    const validSounds = new Set(["A","B","C","D","E","F","G","H"]);
    for (const stim of s.stimuli) {
      expect(validSounds.has(stim.sound)).toBe(true);
    }
  });

  it("same seed same stimuli", () => {
    const stims = (seed: number) => reducer(initialState(seed, n1), { type: "start" }).stimuli;
    const a = stims(10);
    const b = stims(10);
    expect(a.length).toBe(b.length);
    for (let i = 0; i < a.length; i++) {
      expect(a[i]!.gridCell).toBe(b[i]!.gridCell);
      expect(a[i]!.sound).toBe(b[i]!.sound);
    }
  });
});

describe("DualNBack next-stimulus", () => {
  it("for first n trials moves directly to next without respond", () => {
    let s = reducer(initialState(42, n2), { type: "start" });
    // Index 0, n=2, so skip respond
    s = reducer(s, { type: "next-stimulus" });
    expect(s.currentIndex).toBe(1);
    expect(s.phase).toBe("showing");
  });

  it("after n trials transitions to respond phase", () => {
    let s = reducer(initialState(42, n1), { type: "start" });
    // n=1, so at index 0 we still need index >= n=1, skip
    s = reducer(s, { type: "next-stimulus" }); // index -> 1
    // Now at index 1, which is >= n=1
    s = reducer(s, { type: "next-stimulus" }); // should go to respond
    expect(s.phase).toBe("respond");
  });
});

describe("DualNBack respond", () => {
  function reachRespond(seed: number) {
    let s = reducer(initialState(seed, n1), { type: "start" });
    // Skip first n=1 trials without respond
    s = reducer(s, { type: "next-stimulus" }); // index 1
    s = reducer(s, { type: "next-stimulus" }); // now respond at index 1
    return s;
  }

  it("press-position toggles positionMatch", () => {
    const s = reachRespond(42);
    expect(s.phase).toBe("respond");
    const s2 = reducer(s, { type: "press-position" });
    expect(s2.currentResponse.positionMatch).toBe(true);
    const s3 = reducer(s2, { type: "press-position" });
    expect(s3.currentResponse.positionMatch).toBe(false);
  });

  it("press-sound toggles soundMatch", () => {
    const s = reachRespond(42);
    const s2 = reducer(s, { type: "press-sound" });
    expect(s2.currentResponse.soundMatch).toBe(true);
  });

  it("confirm advances to next showing", () => {
    const s = reachRespond(42);
    const s2 = reducer(s, { type: "confirm" });
    expect(s2.phase).toBe("showing");
    expect(s2.currentIndex).toBeGreaterThan(s.currentIndex);
  });

  it("confirm is no-op outside respond phase", () => {
    const s = reducer(initialState(42, n1), { type: "start" });
    const s2 = reducer(s, { type: "confirm" });
    expect(s2.phase).toBe("showing");
    expect(s2.currentIndex).toBe(0); // unchanged
  });
});

describe("DualNBack completion", () => {
  function playThrough(seed: number, n: NLevel = "1") {
    let s = reducer(initialState(seed, { n }), { type: "start" });
    let guard = 0;
    while (s.phase !== "done" && guard < 1000) {
      guard++;
      if (s.phase === "showing") {
        s = reducer(s, { type: "next-stimulus" });
      } else if (s.phase === "respond") {
        s = reducer(s, { type: "confirm" });
      } else break;
    }
    return s;
  }

  it("reaches done after all trials", () => {
    const s = playThrough(42);
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns non-null when done", () => {
    const s = playThrough(42);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, { n: "1" });
    expect(isTerminal(s)).toBeNull();
  });
});

type NLevel = "1" | "2" | "3";
