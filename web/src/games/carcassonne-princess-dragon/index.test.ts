import { describe, it, expect } from "vitest";
import { carcassonnePrincessDragonPlugin } from "./index.js";
import type { CarcassonnePrincessDragonState } from "./state.js";

const S = { dummy: false } as never;

describe("carcassonne-princess-dragon plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonnePrincessDragonPlugin.id).toBe("carcassonne-princess-dragon");
    expect(carcassonnePrincessDragonPlugin.title).toBe("Carcassonne: Princess & Dragon");
    expect(carcassonnePrincessDragonPlugin.category).toBe("board");
    expect(carcassonnePrincessDragonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonnePrincessDragonPlugin.description).toBe("string");
    expect(carcassonnePrincessDragonPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonnePrincessDragonPlugin.settings).toBeDefined();
    expect(typeof carcassonnePrincessDragonPlugin.settings).toBe("object");
    expect(typeof carcassonnePrincessDragonPlugin.initialState).toBe("function");
    expect(typeof carcassonnePrincessDragonPlugin.reducer).toBe("function");
    expect(typeof carcassonnePrincessDragonPlugin.isTerminal).toBe("function");
    expect(carcassonnePrincessDragonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonnePrincessDragonPlugin.initialState(42, S);
    const b = carcassonnePrincessDragonPlugin.initialState(42, S);
    expect(a.cells.join(",")).toBe(b.cells.join(","));
    expect(a.queue.join(",")).toBe(b.queue.join(","));
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.length).toBe(36);
    expect(a.queue.length).toBe(18);
    expect(carcassonnePrincessDragonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof carcassonnePrincessDragonPlugin.hint).toBe("function");
    const state = carcassonnePrincessDragonPlugin.initialState(5, S);
    const result = carcassonnePrincessDragonPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.carcpd-grid > button:nth-child\(\d+\)$/);
      expect(result.pulses).toBe(3);
    }

    // Force fall-through to null: mark phase done so tileBestMoveIndex returns null.
    const doneState: CarcassonnePrincessDragonState = { ...state, phase: "done" };
    expect(carcassonnePrincessDragonPlugin.hint!(doneState)).toBeNull();
  });
});
