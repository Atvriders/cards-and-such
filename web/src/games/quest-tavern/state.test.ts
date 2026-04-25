import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Quest Tavern", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.gold).toBe(20);
    expect(s.phase).toBe("manage");
    expect(s.hired.length).toBe(0);
    expect(s.availableAdventurers.length).toBeGreaterThan(0);
  });

  it("hiring costs gold and adds to roster", () => {
    const s = initialState(42);
    const adv = s.availableAdventurers[0]!;
    const s2 = reducer(s, { type: "hire", adventurerId: adv.id });
    expect(s2.gold).toBe(s.gold - adv.cost);
    expect(s2.hired.some(a => a.id === adv.id)).toBe(true);
    expect(s2.availableAdventurers.some(a => a.id === adv.id)).toBe(false);
  });

  it("cannot hire if insufficient gold", () => {
    const s = { ...initialState(42), gold: 0 };
    const adv = s.availableAdventurers[0]!;
    const s2 = reducer(s, { type: "hire", adventurerId: adv.id });
    expect(s2.hired.length).toBe(0);
    expect(s2.gold).toBe(0);
  });

  it("sending on quest moves quest from available", () => {
    const s = initialState(42);
    const adv = s.availableAdventurers[0]!;
    const s2 = reducer(s, { type: "hire", adventurerId: adv.id });
    const quest = s2.availableQuests[0]!;
    const s3 = reducer(s2, { type: "sendOnQuest", adventurerId: adv.id, questId: quest.id });
    expect(s3.activeQuests.length).toBe(1);
    expect(s3.availableQuests.some(q => q.id === quest.id)).toBe(false);
  });

  it("endDay advances day", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endDay" });
    expect(s2.day).toBe(2);
  });

  it("game ends after maxDays", () => {
    let s = initialState(42);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "endDay" });
    expect(s.phase).toBe("done");
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(42);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "endDay" });
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(0);
    expect(r!.score).toBeLessThanOrEqual(100);
  });
});
