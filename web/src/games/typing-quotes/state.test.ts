import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";

const settingsEasy = { difficulty: "easy" as const };
const settingsMed = { difficulty: "medium" as const };

describe("TypingQuotes initialState", () => {
  it("starts with empty typed, no startTime, not ended", () => {
    const s = initialState(42, settingsEasy);
    expect(s.typed).toBe("");
    expect(s.startTime).toBeNull();
    expect(s.endTime).toBeNull();
  });

  it("quote is a non-empty string", () => {
    const s = initialState(1, settingsEasy);
    expect(s.quote.length).toBeGreaterThan(10);
  });

  it("same seed produces same quote", () => {
    const s1 = initialState(7, settingsEasy);
    const s2 = initialState(7, settingsEasy);
    expect(s1.quote).toBe(s2.quote);
  });

  it("different seeds may differ", () => {
    const s1 = initialState(0, settingsMed);
    const s2 = initialState(999, settingsMed);
    expect(typeof s1.quote).toBe("string");
    expect(typeof s2.quote).toBe("string");
  });
});

describe("TypingQuotes type action", () => {
  it("sets startTime on first character", () => {
    const s = initialState(42, settingsEasy);
    const s2 = reducer(s, { type: "type", text: "T", now: 1000 });
    expect(s2.startTime).toBe(1000);
    expect(s2.typed).toBe("T");
  });

  it("does not change startTime after set", () => {
    const s = initialState(42, settingsEasy);
    const s2 = reducer(s, { type: "type", text: "T", now: 1000 });
    const s3 = reducer(s2, { type: "type", text: "Th", now: 2000 });
    expect(s3.startTime).toBe(1000);
  });

  it("sets endTime when full quote is typed", () => {
    const s = initialState(42, settingsEasy);
    const withStart = reducer(s, { type: "type", text: "A", now: 1000 });
    const finished = reducer(withStart, { type: "type", text: withStart.quote, now: 5000 });
    expect(finished.endTime).toBe(5000);
  });

  it("truncates typed text to quote length", () => {
    const s = initialState(42, settingsEasy);
    const long = s.quote + "EXTRA";
    const s2 = reducer(s, { type: "type", text: long, now: 1000 });
    expect(s2.typed.length).toBe(s.quote.length);
  });
});

describe("TypingQuotes isTerminal and calcScore", () => {
  it("returns null while typing", () => {
    const s = initialState(42, settingsEasy);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when finished", () => {
    const s = initialState(42, settingsEasy);
    const s2 = reducer(s, { type: "type", text: "A", now: 1000 });
    const done = reducer(s2, { type: "type", text: s2.quote, now: 6000 });
    expect(isTerminal(done)).not.toBeNull();
    expect(typeof isTerminal(done)?.score).toBe("number");
  });

  it("calcScore returns 0 without timing", () => {
    const s = initialState(42, settingsEasy);
    expect(calcScore(s)).toBe(0);
  });

  it("no more changes after game ends", () => {
    const s = initialState(42, settingsEasy);
    const s2 = reducer(s, { type: "type", text: "A", now: 1000 });
    const done = reducer(s2, { type: "type", text: s2.quote, now: 6000 });
    const after = reducer(done, { type: "type", text: "changed", now: 9000 });
    expect(after.typed).toBe(done.typed);
  });
});
