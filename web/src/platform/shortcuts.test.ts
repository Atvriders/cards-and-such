import { describe, expect, it } from "vitest";
import { SHORTCUTS, type Shortcut } from "./shortcuts.js";

describe("shortcuts", () => {
  it("exposes shortcuts keyed by known game ids", () => {
    expect(SHORTCUTS).toHaveProperty("klondike");
    expect(SHORTCUTS).toHaveProperty("freecell");
    expect(SHORTCUTS).toHaveProperty("spider");
    expect(SHORTCUTS).toHaveProperty("pyramid");
    expect(SHORTCUTS).toHaveProperty("youtube-clicker");

    const klondike = SHORTCUTS.klondike;
    expect(Array.isArray(klondike)).toBe(true);
    expect(klondike.length).toBeGreaterThan(0);

    const space = klondike.find((s) => s.keys === "Space");
    expect(space).toBeDefined();
    expect(space?.description).toMatch(/draw|stock|flip|waste/i);
  });

  it("every shortcut entry has non-empty keys and description strings", () => {
    const entries = Object.entries(SHORTCUTS);
    expect(entries.length).toBeGreaterThan(0);

    for (const [gameId, list] of entries) {
      expect(gameId).toMatch(/^[a-z0-9-]+$/);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);

      for (const item of list as Shortcut[]) {
        expect(typeof item.keys).toBe("string");
        expect(item.keys.length).toBeGreaterThan(0);
        expect(typeof item.description).toBe("string");
        expect(item.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns undefined for unknown game ids (plain record lookup)", () => {
    expect(SHORTCUTS["no-such-game"]).toBeUndefined();
  });
});
