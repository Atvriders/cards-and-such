import { describe, it, expect } from "vitest";
import { countryRoadMiniPlugin } from "./index.js";

const S = { dummy: true } as const;

describe("country-road-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(countryRoadMiniPlugin.id).toBe("country-road-mini");
    expect(countryRoadMiniPlugin.title).toBe("Country Road Mini");
    expect(countryRoadMiniPlugin.category).toBe("board");
    expect(countryRoadMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof countryRoadMiniPlugin.description).toBe("string");
    expect(countryRoadMiniPlugin.description.length).toBeGreaterThan(0);
    expect(countryRoadMiniPlugin.settings).toBeDefined();
    expect(typeof countryRoadMiniPlugin.settings).toBe("object");
    expect(typeof countryRoadMiniPlugin.initialState).toBe("function");
    expect(typeof countryRoadMiniPlugin.reducer).toBe("function");
    expect(typeof countryRoadMiniPlugin.isTerminal).toBe("function");
    expect(countryRoadMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = countryRoadMiniPlugin.initialState(42, S);
    const b = countryRoadMiniPlugin.initialState(42, S);
    expect(a.idx).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.solved).toBe(false);
    expect(a.score).toBe(0);
    expect(a.puzzles.length).toBe(b.puzzles.length);
    expect(a.puzzles.length).toBeGreaterThan(0);
    const aSig = a.puzzles.map((p) => p.given.join(",") + "|" + p.solution.join(",")).join(";");
    const bSig = b.puzzles.map((p) => p.given.join(",") + "|" + p.solution.join(",")).join(";");
    expect(aSig).toBe(bSig);
    expect(a.current).toEqual(a.puzzles[0]!.given);
    expect(countryRoadMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null on terminal state", () => {
    expect(typeof countryRoadMiniPlugin.hint).toBe("function");
    const state = countryRoadMiniPlugin.initialState(5, S);
    const result = countryRoadMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".countryroadmeadow-num");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const done = { ...state, phase: "done" as const };
    expect(countryRoadMiniPlugin.hint!(done)).toBeNull();
    expect(countryRoadMiniPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
