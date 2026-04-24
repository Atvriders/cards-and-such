import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s26 = { cases: "26" as const };
const s16 = { cases: "16" as const };

describe("DealOrNoDeal initialState", () => {
  it("creates 26 cases in 26-case mode", () => {
    const s = initialState(1, s26);
    expect(s.cases.length).toBe(26);
  });

  it("creates 16 cases in 16-case mode", () => {
    const s = initialState(1, s16);
    expect(s.cases.length).toBe(16);
  });

  it("starts in pick_own phase", () => {
    const s = initialState(1, s26);
    expect(s.phase).toBe("pick_own");
    expect(s.playerCaseId).toBeNull();
  });

  it("all amounts are unique", () => {
    const s = initialState(1, s26);
    const amounts = s.cases.map(c => c.amount);
    const unique = new Set(amounts);
    expect(unique.size).toBe(26);
  });
});

describe("DealOrNoDeal reducer", () => {
  it("pick_case sets playerCaseId and transitions to eliminating", () => {
    const s = initialState(1, s26);
    const s2 = reducer(s, { type: "pick_case", caseId: 5 });
    expect(s2.playerCaseId).toBe(5);
    expect(s2.phase).toBe("eliminating");
  });

  it("cannot eliminate own case", () => {
    const s = { ...initialState(1, s26), playerCaseId: 3, phase: "eliminating" as const };
    const s2 = reducer(s, { type: "eliminate", caseId: 3 });
    expect(s2).toBe(s); // no change
  });

  it("eliminating a case marks it eliminated and decrements count", () => {
    const s = { ...initialState(1, s26), playerCaseId: 1, phase: "eliminating" as const, casesThisRound: 6 };
    const targetId = s.cases.find(c => c.id !== 1)!.id;
    const s2 = reducer(s, { type: "eliminate", caseId: targetId });
    expect(s2.cases.find(c => c.id === targetId)!.eliminated).toBe(true);
    expect(s2.casesThisRound).toBe(5);
  });

  it("completing a round triggers bank offer", () => {
    let s = { ...initialState(1, s26), playerCaseId: 1, phase: "eliminating" as const, casesThisRound: 1 };
    const targetId = s.cases.find(c => !c.eliminated && c.id !== 1)!.id;
    s = reducer(s, { type: "eliminate", caseId: targetId });
    expect(s.phase).toBe("bank_offer");
    expect(s.bankOffer).toBeGreaterThanOrEqual(0);
  });

  it("accept_deal sets phase to deal", () => {
    const s = { ...initialState(1, s26), playerCaseId: 1, phase: "bank_offer" as const, bankOffer: 50000 };
    const s2 = reducer(s, { type: "accept_deal" });
    expect(s2.phase).toBe("deal");
    expect(isTerminal(s2)).toEqual({ score: 50000 });
  });

  it("reject_deal advances round to eliminating", () => {
    const base = initialState(1, s16);
    let s = reducer(base, { type: "pick_case", caseId: 1 });
    // open 4 cases (round 1 for 16-case)
    for (let i = 0; i < 4; i++) {
      const id = s.cases.find(c => !c.eliminated && c.id !== 1)!.id;
      s = reducer(s, { type: "eliminate", caseId: id });
    }
    expect(s.phase).toBe("bank_offer");
    const s2 = reducer(s, { type: "reject_deal" });
    expect(s2.phase).toBe("eliminating");
    expect(s2.round).toBe(2);
  });

  it("isTerminal returns null during play", () => {
    const s = initialState(1, s26);
    expect(isTerminal(s)).toBeNull();
  });
});
