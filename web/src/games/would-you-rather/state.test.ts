import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const };

describe("WouldYouRather initialState", () => {
  it("creates correct number of dilemmas", () => {
    const s = initialState(1, defaultSettings);
    expect(s.dilemmas.length).toBe(10);
  });

  it("starts in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.chosen).toBeNull();
    expect(s.currentIndex).toBe(0);
  });

  it("each dilemma has two options and a percent", () => {
    const s = initialState(1, defaultSettings);
    for (const d of s.dilemmas) {
      expect(typeof d.optionA).toBe("string");
      expect(typeof d.optionB).toBe("string");
      expect(d.percentA).toBeGreaterThanOrEqual(0);
      expect(d.percentA).toBeLessThanOrEqual(100);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.dilemmas.map(d => d.optionA)).toEqual(s2.dilemmas.map(d => d.optionA));
  });
});

describe("WouldYouRather reducer - choose", () => {
  it("choose A records choice and moves to result", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "choose", option: "A" });
    expect(s2.chosen).toBe("A");
    expect(s2.submitted).toBe(true);
    expect(s2.phase).toBe("result");
  });

  it("choose B records choice and moves to result", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "choose", option: "B" });
    expect(s2.chosen).toBe("B");
    expect(s2.phase).toBe("result");
  });

  it("choosing correctly increments majorityMatches", () => {
    const s = initialState(1, defaultSettings);
    const d = s.dilemmas[0]!;
    const majorityOption = d.percentA >= 50 ? "A" : "B";
    const s2 = reducer(s, { type: "choose", option: majorityOption });
    expect(s2.majorityMatches).toBe(1);
  });

  it("choosing minority does not increment majorityMatches", () => {
    const s = initialState(1, defaultSettings);
    const d = s.dilemmas[0]!;
    const minorityOption = d.percentA >= 50 ? "B" : "A";
    const s2 = reducer(s, { type: "choose", option: minorityOption });
    expect(s2.majorityMatches).toBe(0);
  });

  it("cannot choose after already chosen", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "choose", option: "A" });
    const s3 = reducer(s2, { type: "choose", option: "B" });
    expect(s3.chosen).toBe("A");
  });
});

describe("WouldYouRather reducer - next", () => {
  it("next advances to next dilemma", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "choose", option: "A" });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.currentIndex).toBe(1);
    expect(s3.chosen).toBeNull();
    expect(s3.phase).toBe("playing");
  });

  it("next on last round sets done", () => {
    let s = initialState(1, { rounds: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "choose", option: "A" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("WouldYouRather isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns majorityMatches as score when done", () => {
    let s = initialState(1, { rounds: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "choose", option: "A" });
      s = reducer(s, { type: "next" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
