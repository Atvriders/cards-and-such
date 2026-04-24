import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Cursed Crypt", () => {
  it("initializes with 6 rooms, room 0 active", () => {
    const s = initialState(1);
    expect(s.rooms.length).toBe(6);
    expect(s.currentRoom).toBe(0);
    expect(s.playerHp).toBe(35);
    expect(s.phase).toBe("explore");
  });

  it("last room is always the Lich boss", () => {
    const s = initialState(42);
    expect(s.rooms[s.rooms.length - 1]!.type).toBe("boss");
  });

  it("choosing option 0 resolves the room", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", choiceIdx: 0 });
    expect(s2.rooms[0]!.resolved).toBe(true);
  });

  it("advancing from resolved room moves to next room", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "choose", choiceIdx: 0 });
    const s3 = reducer(s2, { type: "advance" });
    expect(s3.currentRoom).toBe(1);
  });

  it("cannot advance from unresolved room", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "advance" });
    expect(s2.currentRoom).toBe(0);
  });

  it("shrine choice 0 heals player", () => {
    const s = initialState(1);
    const shrineRoomIdx = s.rooms.findIndex(r => r.type === "shrine");
    if (shrineRoomIdx < 0) return;
    // Navigate to shrine room
    let cur = s;
    for (let i = 0; i < shrineRoomIdx; i++) {
      cur = reducer(cur, { type: "choose", choiceIdx: 0 });
      cur = reducer(cur, { type: "advance" });
    }
    const hpBefore = Math.min(cur.playerHp, cur.playerMaxHp - 12);
    const modState = { ...cur, playerHp: hpBefore };
    const s2 = reducer(modState, { type: "choose", choiceIdx: 0 });
    expect(s2.playerHp).toBeGreaterThan(hpBefore);
  });

  it("isTerminal null during explore", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal score when escaped", () => {
    const s = { ...initialState(1), phase: "escaped" as const, gold: 80, playerHp: 20 };
    const r = isTerminal(s);
    expect(r!.score).toBe(50 + 80 + 20);
  });

  it("isTerminal score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, gold: 30, currentRoom: 3 };
    const r = isTerminal(s);
    expect(r!.score).toBe(30 + 15);
  });
});
