import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalOnlyClient,
  MockClient,
  getLeaderboardClient,
  isMockLeaderboardEnabled,
  setMockLeaderboardEnabled,
} from "./leaderboardClient.js";
import { recordGame, resetStats } from "./stats.js";
import { useAuth } from "./stores/auth.js";

describe("leaderboardClient", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStats();
    useAuth.getState().logout();
  });

  describe("LocalOnlyClient", () => {
    it("postScore is a no-op", async () => {
      const c = new LocalOnlyClient();
      await expect(c.postScore("klondike", 100, 60, 1)).resolves.toBeUndefined();
    });

    it("getTop returns empty when no plays", async () => {
      const c = new LocalOnlyClient();
      expect(await c.getTop("klondike")).toEqual([]);
    });

    it("getTop returns the user's own best after a play", async () => {
      recordGame("klondike", 750, true);
      const c = new LocalOnlyClient();
      const rows = await c.getTop("klondike");
      expect(rows).toHaveLength(1);
      expect(rows[0]!.score).toBe(750);
    });

    it("getRank is 1 if user has plays, else null", async () => {
      const c = new LocalOnlyClient();
      expect(await c.getRank("klondike")).toBeNull();
      recordGame("klondike", 100, true);
      expect(await c.getRank("klondike")).toBe(1);
    });
  });

  describe("MockClient", () => {
    it("returns 5 named fakes deterministically", async () => {
      const c = new MockClient();
      const a = await c.getTop("klondike", 5);
      const b = await c.getTop("klondike", 5);
      expect(a).toEqual(b);
      const names = new Set(a.map((r) => r.name));
      // All five fake names should appear when there's no local user.
      ["Alice", "Bob", "Charlie", "Diana", "Eve"].forEach((n) =>
        expect(names.has(n)).toBe(true),
      );
    });

    it("different game ids produce different boards", async () => {
      const c = new MockClient();
      const a = await c.getTop("klondike", 5);
      const b = await c.getTop("spider", 5);
      expect(a.map((r) => r.score)).not.toEqual(b.map((r) => r.score));
    });

    it("results are sorted by score desc", async () => {
      const c = new MockClient();
      const rows = await c.getTop("freecell", 5);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i - 1]!.score).toBeGreaterThanOrEqual(rows[i]!.score);
      }
    });
  });

  describe("active-client selection", () => {
    it("defaults to LocalOnlyClient", () => {
      expect(isMockLeaderboardEnabled()).toBe(false);
      expect(getLeaderboardClient()).toBeInstanceOf(LocalOnlyClient);
    });

    it("switches to MockClient when toggle is on", () => {
      setMockLeaderboardEnabled(true);
      expect(isMockLeaderboardEnabled()).toBe(true);
      expect(getLeaderboardClient()).toBeInstanceOf(MockClient);
    });
  });
});
