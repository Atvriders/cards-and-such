import { describe, it, expect } from "vitest";
import { cheminDeFerCasPlugin } from "./index.js";
import type { CheminDeFerCasState } from "./state.js";

const S = { dummy: false } as never;

describe("chemin-de-fer-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cheminDeFerCasPlugin.id).toBe("chemin-de-fer-cas");
    expect(cheminDeFerCasPlugin.title).toBe("Chemin de Fer");
    expect(cheminDeFerCasPlugin.category).toBe("cards");
    expect(cheminDeFerCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cheminDeFerCasPlugin.description).toBe("string");
    expect(cheminDeFerCasPlugin.description.length).toBeGreaterThan(0);
    expect(cheminDeFerCasPlugin.settings).toBeDefined();
    expect(typeof cheminDeFerCasPlugin.settings).toBe("object");
    expect(typeof cheminDeFerCasPlugin.initialState).toBe("function");
    expect(typeof cheminDeFerCasPlugin.reducer).toBe("function");
    expect(typeof cheminDeFerCasPlugin.isTerminal).toBe("function");
    expect(cheminDeFerCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cheminDeFerCasPlugin.initialState(42, S);
    const b = cheminDeFerCasPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("bet");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.bet).toBeNull();
    expect(a.outcome).toBeNull();
    expect(a.player).toEqual([]);
    expect(a.banker).toEqual([]);
    expect(cheminDeFerCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cheminDeFerCasPlugin.hint).toBe("function");
    const fresh = cheminDeFerCasPlugin.initialState(7, S);
    const betHint = cheminDeFerCasPlugin.hint!(fresh);
    expect(betHint).not.toBeNull();
    expect(typeof betHint!.selector).toBe("string");
    expect(betHint!.selector.length).toBeGreaterThan(0);
    expect(betHint!.selector).toContain("chemin-de-fer-cas");
    if (betHint!.pulses !== undefined) {
      expect(typeof betHint!.pulses).toBe("number");
      expect(betHint!.pulses).toBeGreaterThan(0);
    }

    // scored phase should return the secondary hint target
    const scoredState: CheminDeFerCasState = { ...fresh, phase: "scored" };
    const scoredHint = cheminDeFerCasPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toContain("secondary");

    // terminal (done) state -> hint returns null
    const doneState: CheminDeFerCasState = { ...fresh, phase: "done" };
    expect(cheminDeFerCasPlugin.hint!(doneState)).toBeNull();
    expect(cheminDeFerCasPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
