import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, averageReactionTime } from "./state.js";
import type { ReactionTimeState } from "./state.js";

const s5m = { rounds: "5" as const, difficulty: "medium" as const };
const s3e = { rounds: "3" as const, difficulty: "easy" as const };

describe("ReactionTime initialState", () => {
  it("starts in idle phase with 0 rounds completed", () => {
    const s = initialState(42, s5m);
    expect(s.phase).toBe("idle");
    expect(s.currentRound).toBe(0);
    expect(s.totalRounds).toBe(5);
    expect(s.reactionTimes.length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, s5m);
    const s2 = initialState(99, s5m);
    expect(s1.delayMs).toBe(s2.delayMs);
  });

  it("delay is within expected range for difficulty", () => {
    for (const diff of ["easy", "medium", "hard"] as const) {
      const s = initialState(42, { rounds: "5" as const, difficulty: diff });
      expect(s.delayMs).toBeGreaterThanOrEqual(1000);
      expect(s.delayMs).toBeLessThanOrEqual(5000);
    }
  });
});

describe("ReactionTime start-round", () => {
  it("transitions from idle to waiting", () => {
    const s = initialState(42, s5m);
    const s2 = reducer(s, { type: "start-round" });
    expect(s2.phase).toBe("waiting");
    expect(s2.elapsed).toBe(0);
  });

  it("no-op when already waiting", () => {
    const s = initialState(42, s5m);
    const s2 = reducer(s, { type: "start-round" });
    const s3 = reducer(s2, { type: "start-round" });
    expect(s3.phase).toBe("waiting");
    expect(s3.elapsed).toBe(s2.elapsed);
  });
});

describe("ReactionTime tick", () => {
  it("tick in waiting phase advances elapsed", () => {
    const s = initialState(42, s5m);
    const s2 = reducer(s, { type: "start-round" });
    const s3 = reducer(s2, { type: "tick", now: 1000 });
    expect(s3.elapsed).toBeGreaterThan(0);
  });

  it("tick when elapsed >= delayMs switches to signal phase", () => {
    const s = initialState(42, s5m);
    const s2 = reducer(s, { type: "start-round" });
    // Force elapsed past delay
    const nearReady: ReactionTimeState = { ...s2, elapsed: s2.delayMs + 1 };
    const s3 = reducer(nearReady, { type: "tick", now: 5000 });
    expect(s3.phase).toBe("signal");
    expect(s3.signalAt).toBe(5000);
  });

  it("tick during signal phase is no-op", () => {
    const s = initialState(42, s5m);
    const s2 = reducer(s, { type: "start-round" });
    const nearReady: ReactionTimeState = { ...s2, elapsed: s2.delayMs + 1 };
    const s3 = reducer(nearReady, { type: "tick", now: 5000 }); // signal
    const s4 = reducer(s3, { type: "tick", now: 5100 }); // no-op
    expect(s4.phase).toBe("signal");
    expect(s4.signalAt).toBe(5000); // unchanged
  });
});

describe("ReactionTime click", () => {
  it("click during signal records reaction time", () => {
    const s = initialState(42, s5m);
    const signalState: ReactionTimeState = {
      ...s,
      phase: "signal",
      signalAt: 1000,
      currentRound: 0,
    };
    const s2 = reducer(signalState, { type: "click", now: 1250 });
    expect(s2.reactionTimes[0]).toBeCloseTo(250);
    expect(s2.currentRound).toBe(1);
  });

  it("click during waiting = false start (+1000ms penalty)", () => {
    const s = initialState(42, s5m);
    const waiting: ReactionTimeState = { ...s, phase: "waiting" };
    const s2 = reducer(waiting, { type: "click", now: 2000 });
    expect(s2.reactionTimes[0]).toBe(1000);
    expect(s2.currentRound).toBe(1);
  });

  it("completing all rounds transitions to done", () => {
    const s = initialState(42, s3e);
    let cur: ReactionTimeState = s;
    for (let i = 0; i < 3; i++) {
      cur = reducer(cur, { type: "start-round" });
      const signalState: ReactionTimeState = { ...cur, phase: "signal", signalAt: 1000 };
      cur = reducer(signalState, { type: "click", now: 1200 });
    }
    expect(cur.phase).toBe("done");
    expect(cur.reactionTimes.length).toBe(3);
  });
});

describe("ReactionTime isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(42, s5m);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score based on average reaction time", () => {
    const s: ReactionTimeState = {
      ...initialState(42, s3e),
      phase: "done",
      reactionTimes: [200, 200, 200],
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    // avg=200, score = max(0, 1000 - 200/2) = 900
    expect(result!.score).toBe(900);
  });

  it("score floor is 0", () => {
    const s: ReactionTimeState = {
      ...initialState(42, s3e),
      phase: "done",
      reactionTimes: [5000, 5000, 5000],
    };
    const result = isTerminal(s);
    expect(result!.score).toBe(0);
  });
});

describe("averageReactionTime", () => {
  it("returns 0 for empty array", () => {
    expect(averageReactionTime([])).toBe(0);
  });

  it("computes correct average", () => {
    expect(averageReactionTime([100, 200, 300])).toBe(200);
  });
});
