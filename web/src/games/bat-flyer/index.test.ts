import { describe, it, expect } from "vitest";
import { batFlyerPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("bat-flyer plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(batFlyerPlugin.id).toBe("bat-flyer");
    expect(batFlyerPlugin.title).toBe("Bat Flyer");
    expect(batFlyerPlugin.category).toBe("arcade");
    expect(batFlyerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof batFlyerPlugin.description).toBe("string");
    expect(batFlyerPlugin.description.length).toBeGreaterThan(0);
    expect(batFlyerPlugin.settings).toBeDefined();
    expect(typeof batFlyerPlugin.settings).toBe("object");
    expect(typeof batFlyerPlugin.initialState).toBe("function");
    expect(typeof batFlyerPlugin.reducer).toBe("function");
    expect(typeof batFlyerPlugin.isTerminal).toBe("function");
    expect(batFlyerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = batFlyerPlugin.initialState(1234, S);
    const b = batFlyerPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.playerLane).toBe(1);
    expect(a.obstacles).toEqual([]);
    expect(a.score).toBe(0);
    expect(batFlyerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the run is over", () => {
    expect(typeof batFlyerPlugin.hint).toBe("function");
    const playing = batFlyerPlugin.initialState(7, S);
    const playingHint = batFlyerPlugin.hint!(playing);
    expect(playingHint).not.toBeNull();
    expect(typeof playingHint!.selector).toBe("string");
    expect(playingHint!.selector.length).toBeGreaterThan(0);
    expect(playingHint!.selector).toBe('[data-testid="hint-target-bat-flyer-primary"]');
    if (playingHint!.pulses !== undefined) {
      expect(typeof playingHint!.pulses).toBe("number");
      expect(playingHint!.pulses).toBeGreaterThan(0);
    }

    const done = { ...playing, phase: "done" as const };
    expect(batFlyerPlugin.hint!(done)).toBeNull();
    expect(batFlyerPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
