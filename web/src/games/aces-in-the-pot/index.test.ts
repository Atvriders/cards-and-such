import { describe, it, expect } from "vitest";
import { acesInThePotPlugin, acesInThePotSettings } from "./index.js";
import type { AcesState } from "./state.js";

const S = { rounds: "5" } as const;

describe("aces-in-the-pot plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(acesInThePotPlugin.id).toBe("aces-in-the-pot");
    expect(acesInThePotPlugin.title).toBe("Aces in the Pot");
    expect(acesInThePotPlugin.category).toBe("dice");
    expect(acesInThePotPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acesInThePotPlugin.description).toBe("string");
    expect(acesInThePotPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acesInThePotPlugin.howToPlay).toBe("string");
    expect(acesInThePotPlugin.settings).toBe(acesInThePotSettings);
    expect(typeof acesInThePotPlugin.initialState).toBe("function");
    expect(typeof acesInThePotPlugin.reducer).toBe("function");
    expect(typeof acesInThePotPlugin.isTerminal).toBe("function");
    expect(typeof acesInThePotPlugin.hint).toBe("function");
    expect(acesInThePotPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = acesInThePotPlugin.initialState(1234, S);
    const b = acesInThePotPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.playerPennies).toBe(3);
    expect(a.botPennies).toBe(3);
    expect(a.pot).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(5);
    expect(a.gameOver).toBe(false);
    expect(acesInThePotPlugin.isTerminal(a)).toBeNull();

    // isTerminal returns a score when gameOver is true
    const terminal: AcesState = { ...a, gameOver: true, playerWins: 2 };
    const result = acesInThePotPlugin.isTerminal(terminal);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(2);
  });

  it("hint returns a HintTarget for live phases and null when gameOver", () => {
    const state = acesInThePotPlugin.initialState(7, S);
    const rolling = acesInThePotPlugin.hint!(state);
    expect(rolling).not.toBeNull();
    expect(rolling!.selector).toBe('[data-testid="hint-target-aces-in-the-pot-roll"]');
    expect(rolling!.pulses).toBe(3);

    const roundOver = acesInThePotPlugin.hint!({ ...state, phase: "roundOver" });
    expect(roundOver).not.toBeNull();
    expect(roundOver!.selector).toBe('[data-testid="hint-target-aces-in-the-pot-nextRound"]');
    expect(roundOver!.pulses).toBe(3);

    // Unknown phase falls through to default roll target
    const unknown = acesInThePotPlugin.hint!({ ...state, phase: "mystery" as unknown as AcesState["phase"] });
    expect(unknown).not.toBeNull();
    expect(unknown!.selector).toBe('[data-testid="hint-target-aces-in-the-pot-roll"]');

    // gameOver short-circuits to null
    expect(acesInThePotPlugin.hint!({ ...state, gameOver: true })).toBeNull();
  });
});
