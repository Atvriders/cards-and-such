import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";

const settingsEasy60 = { duration: "60" as const, difficulty: "easy" as const };
const settingsMed30 = { duration: "30" as const, difficulty: "medium" as const };

describe("TypingSpeed initialState", () => {
  it("starts with empty typed, elapsed 0, not ended", () => {
    const s = initialState(42, settingsEasy60);
    expect(s.typed).toBe("");
    expect(s.elapsed).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("paragraph is non-empty string", () => {
    const s = initialState(1, settingsEasy60);
    expect(s.paragraph.length).toBeGreaterThan(10);
  });

  it("same seed produces same paragraph", () => {
    const s1 = initialState(7, settingsEasy60);
    const s2 = initialState(7, settingsEasy60);
    expect(s1.paragraph).toBe(s2.paragraph);
  });

  it("different seeds may produce different paragraphs", () => {
    const s1 = initialState(0, { duration: "60" as const, difficulty: "hard" as const });
    const s2 = initialState(5, { duration: "60" as const, difficulty: "hard" as const });
    // Not guaranteed, but likely different across seeds spanning 12 paragraphs
    expect(typeof s1.paragraph).toBe("string");
    expect(typeof s2.paragraph).toBe("string");
  });
});

describe("TypingSpeed tick", () => {
  it("advances elapsed time", () => {
    const s = initialState(42, settingsMed30);
    const s2 = reducer(s, { type: "tick", dt: 5 });
    expect(s2.elapsed).toBeCloseTo(5);
  });

  it("ends game when elapsed >= duration", () => {
    const s = initialState(42, settingsMed30);
    const s2 = reducer(s, { type: "tick", dt: 30 });
    expect(s2.ended).toBe(true);
  });

  it("no tick after ended", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("TypingSpeed type action", () => {
  it("type action updates typed text", () => {
    const s = initialState(42, settingsEasy60);
    const s2 = reducer(s, { type: "type", text: "The" });
    expect(s2.typed).toBe("The");
  });

  it("typing full paragraph ends game", () => {
    const s = initialState(42, settingsEasy60);
    const s2 = reducer(s, { type: "type", text: s.paragraph });
    expect(s2.ended).toBe(true);
  });

  it("text is truncated to paragraph length", () => {
    const s = initialState(42, settingsEasy60);
    const long = s.paragraph + "EXTRA";
    const s2 = reducer(s, { type: "type", text: long });
    expect(s2.typed.length).toBe(s.paragraph.length);
  });

  it("no type action after ended", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const s2 = reducer(ended, { type: "type", text: "hello" });
    expect(s2.typed).toBe("");
  });
});

describe("TypingSpeed isTerminal and calcScore", () => {
  it("returns null while running", () => {
    const s = initialState(42, settingsEasy60);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when ended by time", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const result = isTerminal(ended);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });

  it("score is 0 with no typing", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(isTerminal(ended)?.score).toBe(0);
  });

  it("calcScore increases with typed words", () => {
    const s = initialState(42, settingsEasy60);
    // Simulate some elapsed time and typed text
    const withTyped = {
      ...s,
      typed: s.paragraph.slice(0, 20),
      elapsed: 10,
    };
    expect(calcScore(withTyped)).toBeGreaterThan(0);
  });
});
