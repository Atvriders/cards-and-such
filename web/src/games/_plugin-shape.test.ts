import { describe, it, expect } from "vitest";
import { GAMES } from "./registry.js";
import { defaultsOf } from "../platform/game-plugin/types.js";
import type { SettingSchema } from "../platform/game-plugin/types.js";

const VALID_CATEGORIES = new Set(["solitaire", "cards", "dice", "board", "arcade"]);

/**
 * Registry-driven plugin contract test.
 *
 * Replaces the ~500 hand-written `index.test.ts` files that the GM-task
 * agent loop produced one-per-game. Every plugin in GAMES is exercised
 * with the same assertions; new games are covered automatically when
 * they're added to the registry.
 *
 * Per-plugin behavioural depth (reducer transitions, specific hint
 * selectors, etc.) lives in each game's own `state.test.ts`. This file
 * only asserts the shared `GamePlugin` contract.
 */
describe("plugin contract (registry-driven)", () => {
  it("registry is non-empty", () => {
    expect(GAMES.length).toBeGreaterThan(0);
  });

  it("all plugin ids are unique kebab-case strings", () => {
    const ids = new Set<string>();
    for (const p of GAMES) {
      expect(typeof p.id).toBe("string");
      expect(p.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
    }
  });

  describe.each(GAMES.map((p) => [p.id, p] as const))("%s", (_id, plugin) => {
    const defaults = defaultsOf(plugin.settings as SettingSchema);

    it("identity: title and category", () => {
      expect(typeof plugin.title).toBe("string");
      expect(plugin.title.length).toBeGreaterThan(0);
      expect(VALID_CATEGORIES.has(plugin.category)).toBe(true);
    });

    it("players: valid {min,max,multiplayer}", () => {
      expect(plugin.players.min).toBeGreaterThanOrEqual(1);
      expect(plugin.players.max).toBeGreaterThanOrEqual(plugin.players.min);
      expect(typeof plugin.players.multiplayer).toBe("boolean");
    });

    it("description: non-empty string", () => {
      expect(typeof plugin.description).toBe("string");
      expect(plugin.description.length).toBeGreaterThan(0);
    });

    it("required functions present", () => {
      expect(typeof plugin.initialState).toBe("function");
      expect(typeof plugin.reducer).toBe("function");
      expect(typeof plugin.isTerminal).toBe("function");
      expect(plugin.component).toBeDefined();
    });

    it("initialState(seed, defaults) is deterministic", () => {
      const a = plugin.initialState(42, defaults);
      const b = plugin.initialState(42, defaults);
      // Some plugin states hold lazy/component refs; structural equality is
      // the contract we care about for determinism.
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });

    it("isTerminal returns null on a fresh initial state", () => {
      const s = plugin.initialState(42, defaults);
      expect(plugin.isTerminal(s)).toBeNull();
    });

    if (plugin.hint) {
      it("hint returns null or a valid HintTarget for fresh state", () => {
        const s = plugin.initialState(42, defaults);
        const result = plugin.hint!(s);
        if (result !== null) {
          expect(typeof result.selector).toBe("string");
          expect(result.selector.length).toBeGreaterThan(0);
          if (result.pulses !== undefined) {
            expect(typeof result.pulses).toBe("number");
            expect(result.pulses).toBeGreaterThan(0);
          }
        }
      });

    }
  });
});
