import { describe, it, expect } from "vitest";
import { anacondaPassPlugin } from "./index.js";
import type { AnacondaPassState } from "./state.js";

const S = {} as never;

describe("anaconda-pass plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(anacondaPassPlugin.id).toBe("anaconda-pass");
    expect(anacondaPassPlugin.title).toBe("Anaconda Pass");
    expect(anacondaPassPlugin.category).toBe("cards");
    expect(anacondaPassPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof anacondaPassPlugin.description).toBe("string");
    expect(anacondaPassPlugin.description.length).toBeGreaterThan(0);
    expect(anacondaPassPlugin.settings).toBeDefined();
    expect(typeof anacondaPassPlugin.settings).toBe("object");
    expect(typeof anacondaPassPlugin.initialState).toBe("function");
    expect(typeof anacondaPassPlugin.reducer).toBe("function");
    expect(typeof anacondaPassPlugin.isTerminal).toBe("function");
    expect(anacondaPassPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = anacondaPassPlugin.initialState(42, S);
    const b = anacondaPassPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("ready");
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.score).toBe(0);
    expect(a.hand).toEqual([]);
    expect(anacondaPassPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for ready/dealt phases and null otherwise", () => {
    expect(typeof anacondaPassPlugin.hint).toBe("function");

    const readyState = anacondaPassPlugin.initialState(7, S);
    const readyHint = anacondaPassPlugin.hint!(readyState);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-anaconda-pass-deal"]');
    expect(readyHint!.pulses).toBe(3);

    const dealtState: AnacondaPassState = { ...readyState, phase: "dealt" };
    const dealtHint = anacondaPassPlugin.hint!(dealtState);
    expect(dealtHint).not.toBeNull();
    expect(dealtHint!.selector).toBe('[data-testid="hint-target-anaconda-pass-next"]');
    expect(dealtHint!.pulses).toBe(3);

    const gameoverState: AnacondaPassState = { ...readyState, phase: "gameover" };
    expect(anacondaPassPlugin.hint!(gameoverState)).toBeNull();
    expect(anacondaPassPlugin.isTerminal(gameoverState)).toEqual({ score: gameoverState.score });
  });
});
