import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RummikubSettings, RummikubState, Tile } from "./state.js";

const settings: RummikubSettings = { botCount: "1" };

describe("Rummikub initialState", () => {
  it("player starts with 14 tiles", () => {
    const s = initialState(42, settings);
    expect(s.hand).toHaveLength(14);
  });

  it("bot starts with 14 tiles", () => {
    const s = initialState(42, settings);
    expect(s.botHands[0]).toHaveLength(14);
  });

  it("table starts empty", () => {
    const s = initialState(42, settings);
    expect(s.table).toHaveLength(0);
  });

  it("pool has remaining tiles after dealing", () => {
    const s = initialState(42, settings);
    // 106 total - 14*2 bots = 78 in pool (1 bot)
    expect(s.pool.length).toBe(106 - 14 - 14);
  });
});

describe("Rummikub reducer", () => {
  it("toggle-tile selects a tile", () => {
    const s = initialState(42, settings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggle-tile", id });
    expect(s2.selectedTileIds).toContain(id);
  });

  it("toggle-tile deselects an already-selected tile", () => {
    const s = initialState(42, settings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggle-tile", id });
    const s3 = reducer(s2, { type: "toggle-tile", id });
    expect(s3.selectedTileIds).not.toContain(id);
  });

  it("draw adds a tile to hand", () => {
    const s = initialState(42, settings);
    const prevLen = s.hand.length;
    const s2 = reducer(s, { type: "draw" });
    expect(s2.hand.length).toBe(prevLen + 1);
    expect(s2.pool.length).toBe(s.pool.length - 1);
  });

  it("invalid meld is rejected", () => {
    const s = initialState(42, settings);
    // Select only 2 tiles (not enough for a meld)
    const s2 = reducer(s, { type: "toggle-tile", id: s.hand[0]!.id });
    const s3 = reducer(s2, { type: "toggle-tile", id: s.hand[1]!.id });
    const s4 = reducer(s3, { type: "meld" });
    // Should show error message, hand unchanged
    expect(s4.hand.length).toBe(s.hand.length);
    expect(s4.message).toMatch(/[Ii]nvalid/);
  });

  it("valid group meld places tiles on table", () => {
    // Inject a known valid group: three tiles with same number, different colors
    const base = initialState(1, settings);
    const groupTiles: Tile[] = [
      { id: 200, num: 7, color: "red" },
      { id: 201, num: 7, color: "blue" },
      { id: 202, num: 7, color: "orange" },
    ];
    const s: RummikubState = { ...base, hand: [...base.hand, ...groupTiles] };
    const s2 = reducer(s, { type: "toggle-tile", id: 200 });
    const s3 = reducer(s2, { type: "toggle-tile", id: 201 });
    const s4 = reducer(s3, { type: "toggle-tile", id: 202 });
    const s5 = reducer(s4, { type: "meld" });
    expect(s5.table).toHaveLength(1);
    expect(s5.hand.length).toBe(s.hand.length - 3);
  });

  it("end-turn advances to bot", () => {
    const s = initialState(42, settings);
    // After end-turn bots play and it comes back to player
    const s2 = reducer(s, { type: "end-turn" });
    expect(s2.turn).toBe(0); // back to player after bots done
  });

  it("restart resets to fresh state", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "draw" });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.hand).toHaveLength(14);
    expect(s3.table).toHaveLength(0);
  });
});

describe("Rummikub isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns positive score on player win", () => {
    const base = initialState(1, settings);
    const won: RummikubState = { ...base, gameOver: true, winner: "player" };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("returns 0 on bot win", () => {
    const base = initialState(1, settings);
    const lost: RummikubState = { ...base, gameOver: true, winner: "bot" };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
