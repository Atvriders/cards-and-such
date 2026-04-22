import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getReachable, PLAYER_CAMP, BOT_CAMP } from "./state.js";
import type { HalmaSettings } from "./state.js";

const defaultSettings: HalmaSettings = { opponent: "easy" };

describe("Halma initialState", () => {
  it("has 13 player pieces and 13 bot pieces", () => {
    const s = initialState(42, defaultSettings);
    let playerCount = 0, botCount = 0;
    for (const c of s.grid.coords()) {
      const p = s.grid.get(c);
      if (p === "player") playerCount++;
      if (p === "bot") botCount++;
    }
    expect(playerCount).toBe(13);
    expect(botCount).toBe(13);
    expect(PLAYER_CAMP.length).toBe(13);
    expect(BOT_CAMP.length).toBe(13);
  });

  it("player moves first", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe("player");
    expect(s.winner).toBeNull();
  });

  it("player camp is in top-left, bot camp in bottom-right", () => {
    // Player camp: all in rows 0-4
    for (const { row } of PLAYER_CAMP) {
      expect(row).toBeLessThanOrEqual(4);
    }
    // Bot camp: all in rows 5-9
    for (const { row } of BOT_CAMP) {
      expect(row).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("Halma moves", () => {
  it("piece can step to adjacent empty cell", () => {
    const s = initialState(42, defaultSettings);
    // Find a player piece with an empty 8-neighbor
    for (const camp of PLAYER_CAMP) {
      const reachable = getReachable(s.grid, camp);
      if (reachable.length > 0) {
        expect(reachable.length).toBeGreaterThan(0);
        break;
      }
    }
  });

  it("selecting a player piece updates state", () => {
    const s = initialState(42, defaultSettings);
    const coord = PLAYER_CAMP[0]!;
    const next = reducer(s, { type: "select", coord });
    expect(next.selected?.row).toBe(coord.row);
    expect(next.selected?.col).toBe(coord.col);
  });

  it("cannot select bot piece", () => {
    const s = initialState(42, defaultSettings);
    const botCoord = BOT_CAMP[0]!;
    const next = reducer(s, { type: "select", coord: botCoord });
    expect(next.selected).toBeNull();
  });

  it("isTerminal returns null at start", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
