import { describe, it, expect } from "vitest";
import { bikeRacePlugin } from "./index.js";

const S = { distance: "500" as const };

describe("bike-race plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bikeRacePlugin.id).toBe("bike-race");
    expect(bikeRacePlugin.title).toBe("Bike Race");
    expect(bikeRacePlugin.category).toBe("arcade");
    expect(bikeRacePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bikeRacePlugin.description).toBe("string");
    expect(bikeRacePlugin.description.length).toBeGreaterThan(0);
    expect(typeof bikeRacePlugin.howToPlay).toBe("string");
    expect(bikeRacePlugin.settings).toBeDefined();
    expect(typeof bikeRacePlugin.initialState).toBe("function");
    expect(typeof bikeRacePlugin.reducer).toBe("function");
    expect(typeof bikeRacePlugin.isTerminal).toBe("function");
    expect(typeof bikeRacePlugin.hint).toBe("function");
    expect(bikeRacePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = bikeRacePlugin.initialState(42, S);
    const b = bikeRacePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.seed).toBe(42);
    expect(a.totalDistance).toBe(500);
    expect(a.distanceCovered).toBe(0);
    expect(a.stamina).toBe(100);
    expect(a.speed).toBe(3);
    expect(a.score).toBe(0);
    expect(a.terrain).toBe("flat");
    expect(a.gameOver).toBe(false);
    expect(a.won).toBe(false);
    expect(bikeRacePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once gameOver", () => {
    const playing = bikeRacePlugin.initialState(7, S);
    const playingHint = bikeRacePlugin.hint!(playing);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-bike-race-action"]');
    expect(playingHint!.pulses).toBe(3);

    const overState = { ...playing, gameOver: true };
    expect(bikeRacePlugin.hint!(overState)).toBeNull();
    expect(bikeRacePlugin.isTerminal(overState)).toEqual({ score: playing.score });
  });
});
