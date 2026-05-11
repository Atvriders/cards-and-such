import { describe, it, expect } from "vitest";
import { beatNeighbourShedPlugin } from "./index.js";
import type { BeatNeighbourShedState } from "./state.js";

const S = { dummy: false } as never;

describe("beat-neighbour-shed plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(beatNeighbourShedPlugin.id).toBe("beat-neighbour-shed");
    expect(beatNeighbourShedPlugin.title).toBe("Beat Your Neighbour");
    expect(beatNeighbourShedPlugin.category).toBe("cards");
    expect(beatNeighbourShedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof beatNeighbourShedPlugin.description).toBe("string");
    expect(beatNeighbourShedPlugin.description.length).toBeGreaterThan(0);
    expect(beatNeighbourShedPlugin.settings).toBeDefined();
    expect(typeof beatNeighbourShedPlugin.settings).toBe("object");
    expect(typeof beatNeighbourShedPlugin.initialState).toBe("function");
    expect(typeof beatNeighbourShedPlugin.reducer).toBe("function");
    expect(typeof beatNeighbourShedPlugin.isTerminal).toBe("function");
    expect(beatNeighbourShedPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = beatNeighbourShedPlugin.initialState(42, S);
    const b = beatNeighbourShedPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(beatNeighbourShedPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for ready/scored and null for done", () => {
    expect(typeof beatNeighbourShedPlugin.hint).toBe("function");
    const ready = beatNeighbourShedPlugin.initialState(5, S);
    const readyResult = beatNeighbourShedPlugin.hint!(ready);
    expect(readyResult).not.toBeNull();
    expect(typeof readyResult!.selector).toBe("string");
    expect(readyResult!.selector.length).toBeGreaterThan(0);
    expect(readyResult!.selector).toMatch(/hint-target-beat-neighbour-shed-play/);
    expect(readyResult!.pulses).toBe(3);

    const scored: BeatNeighbourShedState = { ...ready, phase: "scored" };
    const scoredResult = beatNeighbourShedPlugin.hint!(scored);
    expect(scoredResult).not.toBeNull();
    expect(scoredResult!.selector).toMatch(/hint-target-beat-neighbour-shed-next/);
    expect(scoredResult!.pulses).toBe(3);

    const done: BeatNeighbourShedState = { ...ready, phase: "done" };
    expect(beatNeighbourShedPlugin.hint!(done)).toBeNull();
    expect(beatNeighbourShedPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
