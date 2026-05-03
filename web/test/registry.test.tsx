import { describe, expect, it } from "vitest";
import { GAMES } from "../src/games/registry.js";

const VALID_CATEGORIES = new Set(["solitaire", "cards", "dice", "board", "arcade"]);

describe("GAMES registry sanity", () => {
  it("has more than 4000 plugins", () => {
    expect(GAMES.length).toBeGreaterThan(4000);
  });

  it("every plugin has a non-empty id, title, and valid category", () => {
    for (const g of GAMES) {
      expect(typeof g.id, `id must be string for ${g.id}`).toBe("string");
      expect(g.id.length, `id must be non-empty`).toBeGreaterThan(0);
      expect(typeof g.title, `title must be string for ${g.id}`).toBe("string");
      expect(g.title.length, `title must be non-empty for ${g.id}`).toBeGreaterThan(0);
      expect(
        VALID_CATEGORIES.has(g.category),
        `category "${g.category}" not in valid set for ${g.id}`,
      ).toBe(true);
    }
  });

  it("every plugin has a hint: field (100% coverage guard)", () => {
    for (const g of GAMES) {
      expect(typeof g.hint, `hint missing for ${g.id}`).toBe("function");
    }
  });

  it("has no duplicate ids", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const g of GAMES) {
      if (seen.has(g.id)) dupes.push(g.id);
      seen.add(g.id);
    }
    expect(dupes, `duplicate ids: ${dupes.join(", ")}`).toEqual([]);
  });
});
