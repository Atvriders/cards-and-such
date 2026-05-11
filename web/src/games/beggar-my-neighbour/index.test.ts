import { describe, it, expect } from "vitest";
import { beggarMyNeighbourPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("beggar-my-neighbour plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(beggarMyNeighbourPlugin.id).toBe("beggar-my-neighbour");
    expect(beggarMyNeighbourPlugin.title).toBe("Beggar My Neighbour");
    expect(beggarMyNeighbourPlugin.category).toBe("cards");
    expect(beggarMyNeighbourPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof beggarMyNeighbourPlugin.description).toBe("string");
    expect(beggarMyNeighbourPlugin.description.length).toBeGreaterThan(0);
    expect(beggarMyNeighbourPlugin.settings).toBeDefined();
    expect(typeof beggarMyNeighbourPlugin.settings).toBe("object");
    expect(typeof beggarMyNeighbourPlugin.initialState).toBe("function");
    expect(typeof beggarMyNeighbourPlugin.reducer).toBe("function");
    expect(typeof beggarMyNeighbourPlugin.isTerminal).toBe("function");
    expect(beggarMyNeighbourPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = beggarMyNeighbourPlugin.initialState(42, S);
    const b = beggarMyNeighbourPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.you).toBeNull();
    expect(a.cpu).toBeNull();
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(a.ties).toBe(0);
    expect(beggarMyNeighbourPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when phase is ready and null otherwise", () => {
    expect(typeof beggarMyNeighbourPlugin.hint).toBe("function");
    const state = beggarMyNeighbourPlugin.initialState(7, S);
    const result = beggarMyNeighbourPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-beggar-my-neighbour-primary"]');
    expect(result!.pulses).toBe(3);

    const notReady = { ...state, phase: "result" as const };
    expect(beggarMyNeighbourPlugin.hint!(notReady)).toBeNull();

    const done = { ...state, phase: "done" as const };
    expect(beggarMyNeighbourPlugin.hint!(done)).toBeNull();
  });
});
