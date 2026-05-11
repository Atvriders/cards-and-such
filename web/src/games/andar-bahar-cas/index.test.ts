import { describe, it, expect } from "vitest";
import { andarBaharCasPlugin } from "./index.js";
import type { AndarBaharCasState } from "./state.js";

const S = { dummy: false } as never;

describe("andar-bahar-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(andarBaharCasPlugin.id).toBe("andar-bahar-cas");
    expect(andarBaharCasPlugin.title).toBe("Andar Bahar");
    expect(andarBaharCasPlugin.category).toBe("cards");
    expect(andarBaharCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof andarBaharCasPlugin.description).toBe("string");
    expect(andarBaharCasPlugin.description.length).toBeGreaterThan(0);
    expect(andarBaharCasPlugin.settings).toBeDefined();
    expect(typeof andarBaharCasPlugin.settings).toBe("object");
    expect(typeof andarBaharCasPlugin.initialState).toBe("function");
    expect(typeof andarBaharCasPlugin.reducer).toBe("function");
    expect(typeof andarBaharCasPlugin.isTerminal).toBe("function");
    expect(andarBaharCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = andarBaharCasPlugin.initialState(42, S);
    const b = andarBaharCasPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("bet");
    expect(a.score).toBe(0);
    expect(a.joker).toBeNull();
    expect(a.bet).toBeNull();
    expect(andarBaharCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for bet/scored phases and null when terminal", () => {
    expect(typeof andarBaharCasPlugin.hint).toBe("function");
    const fresh = andarBaharCasPlugin.initialState(7, S);

    // bet phase -> primary hint
    const betHint = andarBaharCasPlugin.hint!(fresh);
    expect(betHint).not.toBeNull();
    expect(betHint!.selector).toBe('[data-testid="hint-target-andar-bahar-cas-primary"]');
    expect(betHint!.pulses).toBe(3);

    // scored phase -> secondary hint
    const scored: AndarBaharCasState = { ...fresh, phase: "scored" };
    const scoredHint = andarBaharCasPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-andar-bahar-cas-secondary"]');
    expect(scoredHint!.pulses).toBe(3);

    // terminal (done) -> null
    const done: AndarBaharCasState = { ...fresh, phase: "done" };
    expect(andarBaharCasPlugin.isTerminal(done)).toEqual({ score: 0 });
    expect(andarBaharCasPlugin.hint!(done)).toBeNull();
  });
});
