import { describe, it, expect } from "vitest";
import { connectPipesProPlugin, connectPipesProSettings } from "./index.js";

const S = { size: "5" as const };

describe("connect-pipes-pro plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connectPipesProPlugin.id).toBe("connect-pipes-pro");
    expect(connectPipesProPlugin.title).toBe("Connect Pipes Pro");
    expect(connectPipesProPlugin.category).toBe("board");
    expect(connectPipesProPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connectPipesProPlugin.description).toBe("string");
    expect(connectPipesProPlugin.description.length).toBeGreaterThan(0);
    expect(connectPipesProPlugin.settings).toBe(connectPipesProSettings);
    expect(typeof connectPipesProPlugin.initialState).toBe("function");
    expect(typeof connectPipesProPlugin.reducer).toBe("function");
    expect(typeof connectPipesProPlugin.isTerminal).toBe("function");
    expect(connectPipesProPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = connectPipesProPlugin.initialState(42, S);
    const b = connectPipesProPlugin.initialState(42, S);
    expect(a.size).toBe(5);
    expect(a.won).toBe(false);
    expect(a.movesMade).toBe(0);
    expect(a.activeColor).toBeNull();
    expect(Object.keys(a.endpoints).sort()).toEqual(Object.keys(b.endpoints).sort());
    for (const k of Object.keys(a.endpoints)) {
      expect(a.endpoints[k]).toBe(b.endpoints[k]);
    }
    expect(Object.keys(a.paths).sort()).toEqual(Object.keys(b.paths).sort());
    expect(connectPipesProPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null in non-DOM env and a HintTarget when the grid is present", () => {
    expect(typeof connectPipesProPlugin.hint).toBe("function");
    const state = connectPipesProPlugin.initialState(7, S);

    const originalDocument = (globalThis as { document?: Document }).document;
    try {
      // Force non-DOM branch: hint() should return null.
      delete (globalThis as { document?: Document }).document;
      expect(connectPipesProPlugin.hint!(state)).toBeNull();

      // Stub a minimal document so the truthy branch yields a HintTarget.
      (globalThis as { document?: unknown }).document = {
        querySelector: (sel: string) =>
          sel === ".connect-pipes-grid" ? ({} as Element) : null,
      };
      const result = connectPipesProPlugin.hint!(state);
      expect(result).not.toBeNull();
      expect(result!.selector).toBe(".connect-pipes-grid");
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);

      // Stub a document whose querySelector returns null: falsy branch -> null.
      (globalThis as { document?: unknown }).document = {
        querySelector: () => null,
      };
      expect(connectPipesProPlugin.hint!(state)).toBeNull();
    } finally {
      if (originalDocument === undefined) {
        delete (globalThis as { document?: Document }).document;
      } else {
        (globalThis as { document?: Document }).document = originalDocument;
      }
    }
  });
});
