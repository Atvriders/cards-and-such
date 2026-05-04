import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendTimeHistory,
  readTimeHistory,
  TIME_HISTORY_KEY_PREFIX,
  TIME_HISTORY_LIMIT,
} from "./userdata.js";

/**
 * Edge case: per-game time history is FIFO-capped at TIME_HISTORY_LIMIT.
 *
 * `appendTimeHistory` is called from `recordGame` on every finish; without
 * the cap a heavy player would balloon the localStorage blob over time
 * and corrupt the trend mini-chart. We add LIMIT+2 entries with strictly
 * monotonic `time` values, then assert:
 *   1. exactly LIMIT entries remain in the persisted blob,
 *   2. the OLDEST two are dropped (FIFO, not LIFO or sorted-by-value),
 *   3. the most-recent append is at the tail.
 */

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("appendTimeHistory – FIFO cap", () => {
  it("retains only the last TIME_HISTORY_LIMIT entries, dropping oldest first", () => {
    const gameId = "klondike";
    const total = TIME_HISTORY_LIMIT + 2;

    // Append `total` entries with distinct, monotonically increasing `time`
    // and `now` so we can pinpoint which two were dropped.
    for (let i = 0; i < total; i += 1) {
      // Pass an explicit `now` to keep ts ordering deterministic — the
      // helper otherwise defaults to Date.now() and back-to-back calls
      // could collide on the same millisecond in jsdom.
      appendTimeHistory(gameId, i + 1, undefined, 1_000_000 + i);
    }

    const list = readTimeHistory(gameId);
    expect(list).toHaveLength(TIME_HISTORY_LIMIT);
    // First entry should be the 3rd one we appended (i=2 -> time=3, ts=1_000_002)
    // because the first two entries (i=0, i=1) get dropped FIFO.
    expect(list[0]?.time).toBe(3);
    expect(list[0]?.ts).toBe(1_000_002);
    // Last entry should be the most recent append (i=total-1).
    expect(list[list.length - 1]?.time).toBe(total);
    expect(list[list.length - 1]?.ts).toBe(1_000_000 + total - 1);

    // Sanity: the persisted blob itself is also capped (not just the read
    // path filtering on the way out).
    const raw = localStorage.getItem(`${TIME_HISTORY_KEY_PREFIX}${gameId}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as unknown[];
    expect(parsed).toHaveLength(TIME_HISTORY_LIMIT);
  });
});
