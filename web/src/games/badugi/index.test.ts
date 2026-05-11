import { describe, it, expect } from "vitest";
import { badugiPlugin } from "./index.js";
import type { BadugiState } from "./state.js";

const defaultSettings = { startingBankroll: "1000" as const, anteSize: "25" as const };

describe("badugi plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(badugiPlugin.id).toBe("badugi");
    expect(badugiPlugin.title).toBe("Badugi");
    expect(badugiPlugin.category).toBe("cards");
    expect(badugiPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof badugiPlugin.description).toBe("string");
    expect(badugiPlugin.description.length).toBeGreaterThan(0);
    expect(badugiPlugin.settings).toBeDefined();
    expect(typeof badugiPlugin.settings).toBe("object");
    expect(typeof badugiPlugin.initialState).toBe("function");
    expect(typeof badugiPlugin.reducer).toBe("function");
    expect(typeof badugiPlugin.isTerminal).toBe("function");
    expect(badugiPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = badugiPlugin.initialState(42, defaultSettings);
    const b = badugiPlugin.initialState(42, defaultSettings);
    const aIds = a.deck.map((c) => c.id).join("|");
    const bIds = b.deck.map((c) => c.id).join("|");
    expect(aIds).toBe(bIds);
    expect(a.bankroll).toBe(b.bankroll);
    expect(a.botBankroll).toBe(b.botBankroll);
    expect(a.phase).toBe("waiting");
    expect(badugiPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof badugiPlugin.hint).toBe("function");
    const fresh = badugiPlugin.initialState(7, defaultSettings);

    // Waiting phase with positive bankrolls: should hint at "deal".
    const dealHint = badugiPlugin.hint!(fresh);
    expect(dealHint).not.toBeNull();
    expect(typeof dealHint!.selector).toBe("string");
    expect(dealHint!.selector.length).toBeGreaterThan(0);
    expect(dealHint!.selector).toBe('[data-testid="hint-target-badugi-deal"]');
    expect(dealHint!.pulses).toBe(3);

    // Waiting phase with zero bankroll: hint should be null.
    const bust: BadugiState = { ...fresh, bankroll: 0 };
    expect(badugiPlugin.hint!(bust)).toBeNull();

    // Draw phase: hint at the draw button.
    const drawState: BadugiState = { ...fresh, phase: "draw1" };
    const drawHint = badugiPlugin.hint!(drawState);
    expect(drawHint).not.toBeNull();
    expect(drawHint!.selector).toBe('[data-testid="hint-target-badugi-draw"]');

    // Bet phase where it is NOT the player's turn: hint should be null.
    const botTurn: BadugiState = { ...fresh, phase: "bet1", playerTurn: false };
    expect(badugiPlugin.hint!(botTurn)).toBeNull();
  });
});
