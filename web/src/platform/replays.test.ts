import { beforeEach, describe, expect, it } from "vitest";
import { REPLAY_CAP, REPLAYS_KEY, loadReplays, saveReplay } from "./replays.js";

/**
 * FIFO cap regression for `cards-replays`. Five replays seeded as
 * gameId="g0".."g4"; saving a sixth must evict the oldest ("g0") and
 * leave the persisted list at exactly REPLAY_CAP entries with the new
 * one tail-most.
 */

beforeEach(() => {
  localStorage.clear();
});

describe("saveReplay FIFO cap", () => {
  it("evicts the oldest entry when exceeding REPLAY_CAP", () => {
    for (let i = 0; i < REPLAY_CAP; i++) {
      saveReplay({ gameId: `g${i}`, seed: i, actions: [i] });
    }
    expect(loadReplays()).toHaveLength(REPLAY_CAP);

    const after = saveReplay({ gameId: "g5", seed: 5, actions: [5] });

    expect(after).toHaveLength(REPLAY_CAP);
    const ids = after.map((r) => r.gameId);
    expect(ids).not.toContain("g0");
    expect(ids).toEqual(["g1", "g2", "g3", "g4", "g5"]);

    // And the persisted blob matches the returned list.
    const persisted = loadReplays();
    expect(persisted.map((r) => r.gameId)).toEqual(["g1", "g2", "g3", "g4", "g5"]);
    expect(localStorage.getItem(REPLAYS_KEY)).not.toBeNull();
  });
});
