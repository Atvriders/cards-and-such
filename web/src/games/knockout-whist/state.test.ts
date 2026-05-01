import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("knockout-whist", () => {
  it("starts in playing phase", () => { expect(initialState(1, S).phase).toBe("playing"); });
  it("deals two hands", () => { const s = initialState(1, S); expect(s.hands.length).toBe(2); expect(s.hands[0]!.length).toBe(7); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("playing a card removes it", () => {
    const s = initialState(7, S);
    const cardId = s.hands[0]![0]!.id;
    const s2 = reducer(s, { type: "play", cardId });
    expect(s2.hands[0]!.find(c => c.id === cardId)).toBeUndefined();
  });
  it("is deterministic", () => {
    const a = initialState(99, S); const b = initialState(99, S);
    expect(a.hands[0]!.map(c => c.id)).toEqual(b.hands[0]!.map(c => c.id));
  });
});
