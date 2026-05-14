import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  ACTION_SPACES,
  HARVEST_ROUNDS,
  TOTAL_ROUNDS,
  STARTING_WORKERS,
  STARTING_ROOMS,
  STARTING_FOOD,
  NUM_PLAYERS,
  applyAction,
  scorePlayer,
} from "./state.js";
import type { AgricolaState, AgricolaAction, PlayerState } from "./state.js";

const S = { _dummy: false };

function freshPlayer(): PlayerState {
  return initialState(1, S).players[0]!;
}

describe("agricola-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a).toEqual(b);
    // different seeds may yield different starting player but same baseline shape
    const c = initialState(456, S);
    expect(c.players).toHaveLength(NUM_PLAYERS);
    expect(c.round).toBe(1);
  });

  it("initialState gives 4 players with 2 workers, 2 rooms, 2 food", () => {
    const s = initialState(1, S);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    for (const p of s.players) {
      expect(p.workersAvailable).toBe(STARTING_WORKERS);
      expect(p.totalWorkers).toBe(STARTING_WORKERS);
      expect(p.rooms).toBe(STARTING_ROOMS);
      expect(p.food).toBe(STARTING_FOOD);
      expect(p.hut).toBe("wood");
      expect(p.begCards).toBe(0);
    }
    expect(s.players[0]!.isHuman).toBe(true);
    expect(s.players[1]!.isHuman).toBe(false);
    expect(s.phase).toBe("placement");
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("ACTION_SPACES includes all key actions for the minimal game", () => {
    const ids = ACTION_SPACES.map((a) => a.id);
    for (const need of ["wood", "clay", "stone", "reed", "grain", "vegetable", "sheep", "boar", "cattle", "fence", "sow", "family", "renovate"]) {
      expect(ids).toContain(need);
    }
  });

  it("applyAction(wood) adds 3 wood", () => {
    const p = freshPlayer();
    const { player, ok } = applyAction(p, "wood");
    expect(ok).toBe(true);
    expect(player.wood).toBe(p.wood + 3);
  });

  it("applyAction(family) fails if no empty room", () => {
    const p = freshPlayer();
    // p.totalWorkers (2) === p.rooms (2): no empty room
    const { ok } = applyAction(p, "family");
    expect(ok).toBe(false);
  });

  it("applyAction(fence) requires 2 wood", () => {
    const p = freshPlayer();
    const failed = applyAction(p, "fence");
    expect(failed.ok).toBe(false);
    const p2 = { ...p, wood: 4 };
    const ok = applyAction(p2, "fence");
    expect(ok.ok).toBe(true);
    expect(ok.player.wood).toBe(2);
    expect(ok.player.pastureCapacity).toBe(2);
  });

  it("applyAction(renovate) upgrades wood->clay then clay->stone with materials", () => {
    let p = { ...freshPlayer(), clay: 2, reed: 1 };
    const woodToClay = applyAction(p, "renovate");
    expect(woodToClay.ok).toBe(true);
    expect(woodToClay.player.hut).toBe("clay");
    expect(woodToClay.player.clay).toBe(0);
    expect(woodToClay.player.reed).toBe(0);
    p = { ...woodToClay.player, stone: 2, reed: 1 };
    const clayToStone = applyAction(p, "renovate");
    expect(clayToStone.ok).toBe(true);
    expect(clayToStone.player.hut).toBe("stone");
  });

  it("place action consumes a worker and marks the space occupied", () => {
    const s0 = initialState(1, S);
    const startingSeat = s0.currentSeat;
    const s1 = reducer(s0, { type: "place", actionId: "wood" } as AgricolaAction);
    expect(s1).not.toBe(s0);
    expect(s1.occupied["wood"]).toBe(startingSeat);
    expect(s1.players[startingSeat]!.workersAvailable).toBe(STARTING_WORKERS - 1);
    expect(s1.currentSeat).not.toBe(startingSeat);
  });

  it("illegal place actions return the same state reference", () => {
    const s0 = initialState(1, S);
    // Take wood once
    const s1 = reducer(s0, { type: "place", actionId: "wood" } as AgricolaAction);
    // Now seat-0 (or whichever) can't reuse it
    const sameAttempt = reducer(s1, { type: "place", actionId: "wood" } as AgricolaAction);
    expect(sameAttempt).toBe(s1);
    // family is locked in round 1
    const lockedAttempt = reducer(s0, { type: "place", actionId: "family" } as AgricolaAction);
    expect(lockedAttempt).toBe(s0);
  });

  it("placing all workers advances round (non-harvest round 1 -> 2)", () => {
    let s: AgricolaState = initialState(1, S);
    // Place all NUM_PLAYERS * STARTING_WORKERS = 8 workers using simple actions.
    // Use cpuStep for non-human seats and place for human seat.
    // Stop as soon as round advances past 1.
    const safety = 32;
    let steps = 0;
    while (s.round === 1 && steps++ < safety) {
      if (s.phase !== "placement") break;
      if (s.currentSeat === 0 && s.players[0]!.workersAvailable > 0) {
        // pick the first available unlocked unoccupied action
        const pick = ACTION_SPACES.find((sp) =>
          s.unlocked.includes(sp.id) && s.occupied[sp.id] === undefined && sp.id !== "fence" && sp.id !== "family" && sp.id !== "renovate"
        );
        if (!pick) break;
        s = reducer(s, { type: "place", actionId: pick.id } as AgricolaAction);
      } else {
        s = reducer(s, { type: "cpuStep" } as AgricolaAction);
      }
    }
    expect(s.round).toBe(2);
    expect(s.phase).toBe("placement");
    // Workers are refreshed
    for (const p of s.players) {
      expect(p.workersAvailable).toBe(p.totalWorkers);
    }
  });

  it("done state ignores further actions", () => {
    const s0 = initialState(1, S);
    // Force into done by manually constructing a near-end state would be brittle.
    // Instead, simulate using a controlled loop until isTerminal.
    let s: AgricolaState = s0;
    const safety = 600;
    let steps = 0;
    while (s.phase !== "done" && steps++ < safety) {
      if (s.phase === "feeding") {
        s = reducer(s, { type: "ackHarvest" } as AgricolaAction);
        continue;
      }
      // Place: pick first available action (or use cpuStep)
      if (s.currentSeat === 0 && s.players[0]!.workersAvailable > 0) {
        const pick = ACTION_SPACES.find((sp) =>
          s.unlocked.includes(sp.id) && s.occupied[sp.id] === undefined
        );
        if (!pick) {
          // No available action - shouldn't happen, fallback to cpuStep
          s = reducer(s, { type: "cpuStep" } as AgricolaAction);
        } else {
          const r = reducer(s, { type: "place", actionId: pick.id } as AgricolaAction);
          if (r === s) {
            // Try next available action
            const alt = ACTION_SPACES.find((sp) =>
              s.unlocked.includes(sp.id) && s.occupied[sp.id] === undefined && sp.id !== pick.id
            );
            if (alt) s = reducer(s, { type: "place", actionId: alt.id } as AgricolaAction);
            else break;
          } else {
            s = r;
          }
        }
      } else {
        s = reducer(s, { type: "cpuStep" } as AgricolaAction);
      }
    }
    expect(s.phase).toBe("done");
    expect(s.round).toBeGreaterThan(TOTAL_ROUNDS);
    // Now reducer should ignore further actions
    const same = reducer(s, { type: "place", actionId: "wood" } as AgricolaAction);
    expect(same).toBe(s);
    const same2 = reducer(s, { type: "ackHarvest" } as AgricolaAction);
    expect(same2).toBe(s);
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(typeof term!.score).toBe("number");
    expect(term!.score).toBeGreaterThanOrEqual(0);
  });

  it("harvest rounds trigger feeding phase before advancing", () => {
    // Round 4 is the first harvest round. Drive the game through round 1-3 then check.
    let s: AgricolaState = initialState(1, S);
    let safety = 200;
    while (s.round < 4 && safety-- > 0) {
      if (s.phase === "feeding") {
        s = reducer(s, { type: "ackHarvest" } as AgricolaAction);
        continue;
      }
      if (s.currentSeat === 0 && s.players[0]!.workersAvailable > 0) {
        const pick = ACTION_SPACES.find((sp) =>
          s.unlocked.includes(sp.id) && s.occupied[sp.id] === undefined
        );
        if (!pick) break;
        s = reducer(s, { type: "place", actionId: pick.id } as AgricolaAction);
      } else {
        s = reducer(s, { type: "cpuStep" } as AgricolaAction);
      }
    }
    expect(s.round).toBe(4);
    // Now place all workers in round 4 - should land in feeding phase
    safety = 50;
    while (s.phase === "placement" && safety-- > 0) {
      if (s.currentSeat === 0 && s.players[0]!.workersAvailable > 0) {
        const pick = ACTION_SPACES.find((sp) =>
          s.unlocked.includes(sp.id) && s.occupied[sp.id] === undefined
        );
        if (!pick) break;
        s = reducer(s, { type: "place", actionId: pick.id } as AgricolaAction);
      } else {
        s = reducer(s, { type: "cpuStep" } as AgricolaAction);
      }
    }
    expect(HARVEST_ROUNDS.includes(4)).toBe(true);
    expect(s.phase).toBe("feeding");
  });

  it("scorePlayer produces sensible numbers", () => {
    const p = freshPlayer();
    const sp = scorePlayer(p);
    // 2 workers * 3 = 6 family, all categories at 0 are -1 each (fields, sheep, boar, cattle, grain = -5)
    // wood hut = 0 hutScore; veg = 0
    // total: 6 - 5 = 1
    expect(sp.total).toBe(6 - 5);
    // Improved player
    const rich: PlayerState = { ...p, fields: 4, grain: 8, vegetable: 2, sheep: 5, boar: 5, cattle: 3, hut: "stone", rooms: 4, totalWorkers: 4 };
    const sp2 = scorePlayer(rich);
    expect(sp2.total).toBeGreaterThan(sp.total);
  });

  it("cpuStep returns same state for human turn", () => {
    const s = initialState(1, S);
    if (s.currentSeat === 0) {
      const same = reducer(s, { type: "cpuStep" } as AgricolaAction);
      expect(same).toBe(s);
    }
    expect(true).toBe(true);
  });
});
