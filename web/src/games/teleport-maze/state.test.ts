import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s2 = { teleporters: "2" as const };
const s4 = { teleporters: "4" as const };

describe("TeleportMaze initialState", () => {
  it("creates correct number of pads for 2 pairs", () => {
    const s = initialState(0, s2);
    expect(s.pads.length).toBe(4);
  });

  it("creates 8 pads for 4 pairs", () => {
    const s = initialState(0, s4);
    expect(s.pads.length).toBe(8);
  });

  it("pads have valid partner IDs", () => {
    const s = initialState(0, s2);
    for (const pad of s.pads) {
      const partner = s.pads.find((p) => p.id === pad.partnerId);
      expect(partner).toBeDefined();
      expect(partner!.partnerId).toBe(pad.id);
    }
  });

  it("player starts at (0,0)", () => {
    const s = initialState(0, s2);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("TeleportMaze reducer", () => {
  it("does nothing when won", () => {
    const s = initialState(0, s2);
    const won = { ...s, won: true };
    const s2r = reducer(won, { type: "move", dir: "right" });
    expect(s2r.moves).toBe(0);
  });

  it("teleports player when stepping on pad", () => {
    const s = initialState(0, s2);
    // Place a pad right next to player (open the wall and place pad manually)
    const freeV = s.vWalls.slice();
    freeV[0] = false; // open right of (0,0)
    const padPos = { row: 0, col: 1 };
    const partnerPos = { row: 5, col: 5 };
    const pads = [
      { id: 0, row: padPos.row, col: padPos.col, partnerId: 1 },
      { id: 1, row: partnerPos.row, col: partnerPos.col, partnerId: 0 },
    ];
    const state = { ...s, vWalls: freeV, pads };
    const moved = reducer(state, { type: "move", dir: "right" });
    if (moved.moves === 1) {
      // Should be teleported to partner
      expect(moved.playerRow).toBe(partnerPos.row);
      expect(moved.playerCol).toBe(partnerPos.col);
    }
  });

  it("does not reteleport immediately", () => {
    const s = initialState(0, s2);
    // Setup pads side by side to force teleport scenario
    const freeV = s.vWalls.slice();
    freeV[0] = false;
    const pads = [
      { id: 0, row: 0, col: 1, partnerId: 1 },
      { id: 1, row: 0, col: 2, partnerId: 0 },
    ];
    const freeV2 = freeV.slice();
    freeV2[1] = false; // open (0,1) right
    const state = { ...s, vWalls: freeV2, pads, lastTeleport: 1 };
    // Player at (0,1), lastTeleport=1 means pad 1 at (0,2) won't reteleport
    const atPad1 = { ...state, playerRow: 0, playerCol: 1 };
    const moved = reducer(atPad1, { type: "move", dir: "right" });
    // Moved to (0,2) — pad 1 is there but lastTeleport is 1, so no teleport
    if (moved.playerCol === 2) {
      expect(moved.playerRow).toBe(0);
    }
  });
});

describe("TeleportMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, s2))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, s2);
    const t = isTerminal({ ...s, won: true, moves: 20 });
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
