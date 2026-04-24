import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { slots: "9" as const, speed: "normal" as const };

describe("initialState", () => {
  it("starts empty with 5 lives", () => {
    const s = initialState(42, settings);
    expect(s.lives).toBe(5);
    expect(s.score).toBe(0);
    expect(s.viruses).toHaveLength(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed gives same spawn pattern", () => {
    const s1 = initialState(123, settings);
    const s2 = initialState(123, settings);
    // Tick both forward and compare first virus spawned
    const a1 = reducer(s1, { type: "tick", dt: 1.0 });
    const a2 = reducer(s2, { type: "tick", dt: 1.0 });
    expect(a1.viruses.length).toBe(a2.viruses.length);
    if (a1.viruses.length > 0) {
      expect(a1.viruses[0]!.slot).toBe(a2.viruses[0]!.slot);
    }
  });
});

describe("whack action", () => {
  it("whacking a virus increases score", () => {
    const s = initialState(42, settings);
    const ticked = reducer(s, { type: "tick", dt: 1.0 });
    const virus = ticked.viruses[0];
    if (!virus) return; // skip if none spawned
    const after = reducer(ticked, { type: "whack", id: virus.id });
    expect(after.score).toBeGreaterThan(0);
    expect(after.viruses.find((v) => v.id === virus.id)!.whacked).toBe(true);
  });
});

describe("missed virus costs life", () => {
  it("letting a virus expire loses a life", () => {
    const s = initialState(42, settings);
    // Inject a virus that is about to expire
    const withVirus: typeof s = {
      ...s,
      viruses: [{ id: 99, slot: 0, spawnTime: 0, duration: 1.0, type: "normal", whacked: false }],
      elapsed: 0.95,
    };
    // Tick past expiry
    const after = reducer(withVirus, { type: "tick", dt: 0.1 });
    expect(after.lives).toBeLessThan(5);
  });
});

describe("game ends after duration", () => {
  it("over=true when elapsed >= duration", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: s.duration + 0.1 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 80 };
    expect(isTerminal(s)).toEqual({ score: 80 });
  });
});
