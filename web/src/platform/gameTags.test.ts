import { describe, expect, it } from "vitest";
import {
  QUICK_GAME_IDS,
  CHALLENGING_GAME_IDS,
  pickBadgeKind,
} from "./gameTags.js";

describe("gameTags", () => {
  it("respects the badge priority: new > challenging > quick > popular > editors-pick", () => {
    const opts = { featuredIds: ["chess"] as const, topRatedThreshold: 4.5 };
    // "new" wins over everything else, even if the id is challenging and featured.
    expect(pickBadgeKind("chess", true, 5, opts)).toBe("new");
    // Without "new", a CHALLENGING id beats QUICK / popular / featured.
    expect(pickBadgeKind("chess", false, 5, opts)).toBe("challenging");
    // A QUICK id beats popular / featured.
    expect(pickBadgeKind("speed", false, 5, {
      featuredIds: ["speed"],
      topRatedThreshold: 4.5,
    })).toBe("quick");
    // A non-listed game with a high rating earns "popular".
    expect(pickBadgeKind("not-listed", false, 4.6, {
      featuredIds: ["not-listed"],
      topRatedThreshold: 4.5,
    })).toBe("popular");
    // A non-listed game with no/low rating falls through to "editors-pick".
    expect(pickBadgeKind("not-listed", false, 1.0, {
      featuredIds: ["not-listed"],
      topRatedThreshold: 4.5,
    })).toBe("editors-pick");
    expect(pickBadgeKind("not-listed", false, undefined, {
      featuredIds: ["not-listed"],
      topRatedThreshold: 4.5,
    })).toBe("editors-pick");
    // Totally unknown -> null.
    expect(pickBadgeKind("ghost-game", false, undefined, {
      featuredIds: [],
      topRatedThreshold: 4.5,
    })).toBeNull();
  });

  it("treats the popular threshold inclusively and rejects ratings below it", () => {
    const opts = { featuredIds: [] as readonly string[], topRatedThreshold: 4.5 };
    expect(pickBadgeKind("unknown-x", false, 4.5, opts)).toBe("popular");
    expect(pickBadgeKind("unknown-x", false, 4.49, opts)).toBeNull();
    // Missing rating must not count as popular.
    expect(pickBadgeKind("unknown-x", false, undefined, opts)).toBeNull();
  });

  it("exposes disjoint QUICK and CHALLENGING id sets with known members", () => {
    expect(QUICK_GAME_IDS.has("speed")).toBe(true);
    expect(QUICK_GAME_IDS.has("wordle-mini")).toBe(true);
    expect(CHALLENGING_GAME_IDS.has("chess")).toBe(true);
    expect(CHALLENGING_GAME_IDS.has("go")).toBe(true);
    // The two sets must not overlap — that would make the priority order
    // observable for the same id, which the badge-picker contract forbids.
    for (const id of QUICK_GAME_IDS) {
      expect(CHALLENGING_GAME_IDS.has(id)).toBe(false);
    }
  });
});
