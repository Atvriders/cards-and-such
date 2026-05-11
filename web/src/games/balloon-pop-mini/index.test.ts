import { describe, it, expect } from "vitest";
import { balloonPopMiniPlugin } from "./index.js";
import { TIMER_TICKS } from "./state.js";

const S = { dummy: false };

describe("balloon-pop-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(balloonPopMiniPlugin.id).toBe("balloon-pop-mini");
    expect(balloonPopMiniPlugin.title).toBe("Balloon Pop Mini");
    expect(balloonPopMiniPlugin.category).toBe("arcade");
    expect(balloonPopMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof balloonPopMiniPlugin.description).toBe("string");
    expect(balloonPopMiniPlugin.description.length).toBeGreaterThan(0);
    expect(typeof balloonPopMiniPlugin.howToPlay).toBe("string");
    expect(balloonPopMiniPlugin.settings).toBeDefined();
    expect(typeof balloonPopMiniPlugin.initialState).toBe("function");
    expect(typeof balloonPopMiniPlugin.reducer).toBe("function");
    expect(typeof balloonPopMiniPlugin.isTerminal).toBe("function");
    expect(typeof balloonPopMiniPlugin.hint).toBe("function");
    expect(balloonPopMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = balloonPopMiniPlugin.initialState(42, S);
    const b = balloonPopMiniPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.items).toEqual([]);
    expect(a.nextId).toBe(1);
    expect(a.ticksRemaining).toBe(TIMER_TICKS);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.phase).toBe("playing");
    expect(balloonPopMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when targets exist and null otherwise", () => {
    const empty = balloonPopMiniPlugin.initialState(7, S);
    // No items yet — hint should be null.
    expect(balloonPopMiniPlugin.hint!(empty)).toBeNull();

    // After one tick, the reducer spawns at least one item.
    const ticked = balloonPopMiniPlugin.reducer(empty, { type: "tick" });
    expect(ticked.items.length).toBeGreaterThan(0);
    const playingHint = balloonPopMiniPlugin.hint!(ticked);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-balloon-pop-mini-target"]');
    expect(playingHint!.pulses).toBe(3);

    // Done phase always returns null even with items.
    const doneState = { ...ticked, phase: "done" as const };
    expect(balloonPopMiniPlugin.hint!(doneState)).toBeNull();
    expect(balloonPopMiniPlugin.isTerminal(doneState)).toEqual({ score: ticked.score });
  });
});
