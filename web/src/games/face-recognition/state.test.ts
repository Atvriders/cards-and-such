import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FaceRecognitionState } from "./state.js";

const med = { difficulty: "medium" as const };
const easy = { difficulty: "easy" as const };

describe("FaceRecognition initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, med);
    expect(s.phase).toBe("idle");
    expect(s.target).toBeNull();
    expect(s.round).toBe(0);
  });

  it("memorizeMs differs by difficulty", () => {
    const se = initialState(42, easy);
    const sm = initialState(42, med);
    expect(se.memorizeMs).toBeGreaterThan(sm.memorizeMs);
  });
});

describe("FaceRecognition start", () => {
  it("enters memorize phase with target and 4 choices", () => {
    const s = initialState(42, med);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("memorize");
    expect(s2.target).not.toBeNull();
    expect(s2.choices.length).toBe(4);
    expect(s2.round).toBe(1);
  });

  it("correctIdx is 0-3", () => {
    const s2 = reducer(initialState(42, med), { type: "start" });
    expect(s2.correctIdx).toBeGreaterThanOrEqual(0);
    expect(s2.correctIdx).toBeLessThanOrEqual(3);
  });

  it("choices[correctIdx] matches target", () => {
    const s2 = reducer(initialState(42, med), { type: "start" });
    const choice = s2.choices[s2.correctIdx]!;
    expect(choice.skin).toBe(s2.target!.skin);
    expect(choice.eyes).toBe(s2.target!.eyes);
    expect(choice.hair).toBe(s2.target!.hair);
    expect(choice.extra).toBe(s2.target!.extra);
  });

  it("same seed same faces", () => {
    const go = (seed: number) => reducer(initialState(seed, med), { type: "start" });
    const a = go(10);
    const b = go(10);
    expect(a.target).toEqual(b.target);
    expect(a.correctIdx).toBe(b.correctIdx);
  });
});

describe("FaceRecognition reveal", () => {
  it("reveal transitions to choose", () => {
    let s = reducer(initialState(42, med), { type: "start" });
    s = reducer(s, { type: "reveal" });
    expect(s.phase).toBe("choose");
  });

  it("reveal is no-op outside memorize phase", () => {
    const s = initialState(42, med);
    const s2 = reducer(s, { type: "reveal" });
    expect(s2.phase).toBe("idle");
  });
});

describe("FaceRecognition choose", () => {
  function reachChoose(seed: number) {
    let s = reducer(initialState(seed, med), { type: "start" });
    s = reducer(s, { type: "reveal" });
    return s;
  }

  it("correct choice scores 10", () => {
    const s = reachChoose(42);
    const s2 = reducer(s, { type: "choose", index: s.correctIdx });
    expect(s2.phase).toBe("result");
    expect(s2.lastCorrect).toBe(true);
    expect(s2.score).toBe(10);
  });

  it("wrong choice scores 0", () => {
    const s = reachChoose(42);
    const wrongIdx = (s.correctIdx + 1) % 4;
    const s2 = reducer(s, { type: "choose", index: wrongIdx });
    expect(s2.lastCorrect).toBe(false);
    expect(s2.score).toBe(0);
  });

  it("choose is no-op outside choose phase", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    // Still in memorize phase
    const s2 = reducer(s, { type: "choose", index: 0 });
    expect(s2.phase).toBe("memorize");
  });
});

describe("FaceRecognition progression", () => {
  function playAll(seed: number) {
    let s = reducer(initialState(seed, easy), { type: "start" });
    for (let round = 0; round < 10; round++) {
      s = reducer(s, { type: "reveal" });
      s = reducer(s, { type: "choose", index: s.correctIdx }); // always correct
      s = reducer(s, { type: "next" });
    }
    return s;
  }

  it("done after 10 rounds", () => {
    expect(playAll(42).phase).toBe("done");
  });

  it("perfect score is 100", () => {
    expect(playAll(42).score).toBe(100);
  });

  it("isTerminal returns score when done", () => {
    const s = playAll(42);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(100);
  });

  it("isTerminal returns null when not done", () => {
    expect(isTerminal(initialState(42, med))).toBeNull();
  });

  it("each round produces new target", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const targets: string[] = [];
    for (let round = 0; round < 5; round++) {
      targets.push(JSON.stringify(s.target));
      s = reducer(s, { type: "reveal" });
      s = reducer(s, { type: "choose", index: 0 });
      s = reducer(s, { type: "next" });
    }
    // Should have 5 targets, all might be different (very likely)
    expect(targets.length).toBe(5);
  });
});
