import { describe, it, expect } from "vitest";
import { azulBasePlugin } from "./index.js";
import type { AzulBaseState } from "./state.js";

const S = { dummy: false };

describe("azul-base plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(azulBasePlugin.id).toBe("azul-base");
    expect(azulBasePlugin.title).toBe("Azul");
    expect(azulBasePlugin.category).toBe("board");
    expect(azulBasePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof azulBasePlugin.description).toBe("string");
    expect(azulBasePlugin.description.length).toBeGreaterThan(0);
    expect(azulBasePlugin.settings).toBeDefined();
    expect(typeof azulBasePlugin.settings).toBe("object");
    expect(typeof azulBasePlugin.initialState).toBe("function");
    expect(typeof azulBasePlugin.reducer).toBe("function");
    expect(typeof azulBasePlugin.isTerminal).toBe("function");
    expect(azulBasePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = azulBasePlugin.initialState(42, S);
    const b = azulBasePlugin.initialState(42, S);
    expect(a.cells.join(",")).toBe(b.cells.join(","));
    expect(a.queue.join(",")).toBe(b.queue.join(","));
    expect(a.placed).toBe(b.placed);
    expect(a.placed).toBe(0);
    expect(a.phase).toBe("playing");
    expect(azulBasePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget pointing at the azulb-grid", () => {
    expect(typeof azulBasePlugin.hint).toBe("function");
    const state = azulBasePlugin.initialState(7, S);
    const result = azulBasePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("azulb-grid");
      expect(result.pulses).toBe(3);
    }

    // Force the no-hint branch by marking the game as done with a full board.
    const finished: AzulBaseState = {
      ...state,
      phase: "done",
      cells: state.cells.map((c) => (c < 0 ? 0 : c)),
    };
    expect(azulBasePlugin.hint!(finished)).toBeNull();
  });
});
