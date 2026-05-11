import { describe, it, expect } from "vitest";
import { castleDefenderPlugin } from "./index.js";
import type { CastleSettings } from "./state.js";

const S: CastleSettings = { waves: "5" };

describe("castleDefenderPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(castleDefenderPlugin.id).toBe("castle-defender");
    expect(castleDefenderPlugin.title).toBe("Castle Defender");
    expect(castleDefenderPlugin.category).toBe("arcade");
    expect(castleDefenderPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof castleDefenderPlugin.description).toBe("string");
    expect(castleDefenderPlugin.description.length).toBeGreaterThan(0);
    expect(castleDefenderPlugin.settings).toBeDefined();
    expect(castleDefenderPlugin.settings.waves.kind).toBe("enum");
    expect(castleDefenderPlugin.settings.waves.default).toBe("5");
    expect(castleDefenderPlugin.settings.waves.options).toEqual(["3", "5", "7"]);
    expect(typeof castleDefenderPlugin.initialState).toBe("function");
    expect(typeof castleDefenderPlugin.reducer).toBe("function");
    expect(typeof castleDefenderPlugin.isTerminal).toBe("function");
    expect(typeof castleDefenderPlugin.hint).toBe("function");
    expect(castleDefenderPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = castleDefenderPlugin.initialState(42, S);
    const b = castleDefenderPlugin.initialState(42, S);
    const c = castleDefenderPlugin.initialState(43, S);

    // baseline fresh-state invariants
    expect(a.castleHP).toBe(100);
    expect(a.maxCastleHP).toBe(100);
    expect(a.enemies).toEqual([]);
    expect(a.arrows).toEqual([]);
    expect(a.wave).toBe(1);
    expect(a.maxWaves).toBe(5);
    expect(a.gold).toBe(50);
    expect(a.archerCount).toBe(1);
    expect(a.score).toBe(0);
    expect(a.over).toBe(false);
    expect(a.victory).toBe(false);
    expect(a.ticks).toBe(0);
    expect(a.enemiesThisWave).toBe(5);
    expect(a.enemiesSpawned).toBe(0);

    // same seed -> identical rngSeed; different seed -> (almost certainly) different rngSeed
    expect(b.rngSeed).toBe(a.rngSeed);
    expect(c.rngSeed).not.toBe(a.rngSeed);

    // 3-wave setting respected
    const three = castleDefenderPlugin.initialState(1, { waves: "3" });
    expect(three.maxWaves).toBe(3);

    expect(castleDefenderPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    const playing = castleDefenderPlugin.initialState(7, S);
    const target = castleDefenderPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-castle-defender-action"]');
    expect(target!.pulses).toBe(3);

    // When over=true, hint branch via gameOver should return null.
    const ended = { ...playing, over: true, gameOver: true } as typeof playing & { gameOver: boolean };
    expect(castleDefenderPlugin.hint!(ended)).toBeNull();

    // isTerminal: over -> { score }, otherwise null
    expect(castleDefenderPlugin.isTerminal({ ...playing, over: true })).toEqual({ score: playing.score });
    expect(castleDefenderPlugin.isTerminal(playing)).toBeNull();
  });
});
