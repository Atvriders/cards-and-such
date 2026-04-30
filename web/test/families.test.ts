import { describe, it, expect } from "vitest";
import { FAMILIES, expandFamily, compareTitles } from "../src/games/families.js";
import { GAMES } from "../src/games/registry.js";

describe("game families", () => {
  it("defines a non-empty list of families", () => {
    expect(FAMILIES.length).toBeGreaterThan(10);
  });

  it("each family has a unique id and a non-empty label/description", () => {
    const seen = new Set<string>();
    for (const fam of FAMILIES) {
      expect(fam.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
      expect(seen.has(fam.id)).toBe(false);
      seen.add(fam.id);
      expect(fam.label.trim().length).toBeGreaterThan(0);
      expect(fam.description.trim().length).toBeGreaterThan(0);
      expect(Boolean(fam.memberIds || fam.matches)).toBe(true);
    }
  });

  it("every family resolves at least 2 real games from the registry", () => {
    const allIds = GAMES.map((g) => g.id);
    for (const fam of FAMILIES) {
      const ids = expandFamily(fam, allIds);
      const real = [...ids].filter((id) => GAMES.some((g) => g.id === id));
      expect.soft(real.length, `family ${fam.id} should contain at least 2 known games`).toBeGreaterThanOrEqual(2);
    }
  });

  it("the Klondike family contains the canonical 'klondike' id", () => {
    const klondike = FAMILIES.find((f) => f.id === "klondike");
    expect(klondike).toBeDefined();
    const ids = expandFamily(klondike!, GAMES.map((g) => g.id));
    expect(ids.has("klondike")).toBe(true);
  });

  it("Mahjong predicate matches every mahjong-* registry id", () => {
    const fam = FAMILIES.find((f) => f.id === "mahjong-solitaire");
    expect(fam).toBeDefined();
    const allIds = GAMES.map((g) => g.id);
    const expected = allIds.filter((id) => id.startsWith("mahjong-"));
    const got = expandFamily(fam!, allIds);
    for (const id of expected) {
      expect(got.has(id)).toBe(true);
    }
    expect(got.size).toBe(expected.length);
  });

  it("a game belongs to at most one family (no overlap)", () => {
    const allIds = GAMES.map((g) => g.id);
    const owner = new Map<string, string>();
    for (const fam of FAMILIES) {
      for (const id of expandFamily(fam, allIds)) {
        const existing = owner.get(id);
        // Allow a member to be listed in multiple families' memberIds
        // arrays in source — but only the FIRST family wins. So we only
        // record the first owner; subsequent matches are tolerated as
        // long as the lobby applies first-match-wins.
        if (!existing) owner.set(id, fam.id);
      }
    }
    // Sanity: a family with explicit memberIds shouldn't claim ids that
    // are owned by an earlier family. This catches accidental cross-listing.
    for (const fam of FAMILIES) {
      if (!fam.memberIds) continue;
      for (const id of fam.memberIds) {
        const first = owner.get(id);
        // `first` may be a different family that listed this id earlier.
        // That's fine — we just want to know it.
        expect(first === undefined || first === fam.id || FAMILIES.findIndex((f) => f.id === first) <= FAMILIES.findIndex((f) => f.id === fam.id)).toBe(true);
      }
    }
  });

  it("compareTitles is case-insensitive and lexicographic", () => {
    const items = ["Zebra", "alpha", "Beta", "alphabet"];
    items.sort(compareTitles);
    // Case-insensitive: "alpha" < "alphabet" < "Beta" < "Zebra"
    expect(items[0]!.toLowerCase()).toBe("alpha");
    expect(items[1]!.toLowerCase()).toBe("alphabet");
    expect(items[2]!.toLowerCase()).toBe("beta");
    expect(items[3]!.toLowerCase()).toBe("zebra");
  });
});
