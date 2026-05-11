import { describe, it, expect } from "vitest";
import { casinoWarPlugin, casinoWarSettings } from "./index.js";
import type { CasinoWarSettings, CasinoWarState } from "./state.js";

const SETTINGS: CasinoWarSettings = {
  startingBankroll: casinoWarSettings.startingBankroll.default,
  anteSize: casinoWarSettings.anteSize.default,
  handsPerSession: casinoWarSettings.handsPerSession.default,
};

describe("casino-war plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(casinoWarPlugin.id).toBe("casino-war");
    expect(casinoWarPlugin.title).toBe("Casino War");
    expect(casinoWarPlugin.category).toBe("cards");
    expect(casinoWarPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof casinoWarPlugin.description).toBe("string");
    expect(casinoWarPlugin.description.length).toBeGreaterThan(0);
    expect(casinoWarPlugin.settings).toBe(casinoWarSettings);
    expect(typeof casinoWarPlugin.initialState).toBe("function");
    expect(typeof casinoWarPlugin.reducer).toBe("function");
    expect(typeof casinoWarPlugin.isTerminal).toBe("function");
    expect(casinoWarPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = casinoWarPlugin.initialState(42, SETTINGS);
    const b = casinoWarPlugin.initialState(42, SETTINGS);
    expect(a.bankroll).toBe(SETTINGS.startingBankroll);
    expect(a.handsPlayed).toBe(0);
    expect(a.phase).toBe("betting");
    expect(a.playerCard).toBeNull();
    expect(a.dealerCard).toBeNull();
    expect(a.discardPile).toEqual([]);
    // Shoe is 6 standard decks of 52 cards
    expect(a.shoe.length).toBe(6 * 52);
    // Shoe order matches between two same-seed inits
    const aIds = a.shoe.map((c) => c.id).join("|");
    const bIds = b.shoe.map((c) => c.id).join("|");
    expect(aIds).toBe(bIds);
    // Different seed should generally produce a different shoe order
    const c = casinoWarPlugin.initialState(43, SETTINGS);
    const cIds = c.shoe.map((x) => x.id).join("|");
    expect(cIds).not.toBe(aIds);
    expect(casinoWarPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns the right HintTarget for each phase, or null otherwise", () => {
    expect(typeof casinoWarPlugin.hint).toBe("function");
    const fresh = casinoWarPlugin.initialState(7, SETTINGS);
    // betting phase: should hint at the deal button
    const bettingHint = casinoWarPlugin.hint!(fresh);
    expect(bettingHint).not.toBeNull();
    expect(bettingHint!.selector).toBe('[data-testid="hint-target-casino-war-deal"]');
    expect(bettingHint!.pulses).toBe(3);

    // tie-decision phase: should hint at the war button
    const tieState: CasinoWarState = { ...fresh, phase: "tie-decision" };
    const tieHint = casinoWarPlugin.hint!(tieState);
    expect(tieHint).not.toBeNull();
    expect(tieHint!.selector).toBe('[data-testid="hint-target-casino-war-war"]');
    expect(tieHint!.pulses).toBe(3);

    // settled phase: should hint at the deal button (start next hand)
    const settledState: CasinoWarState = { ...fresh, phase: "settled" };
    const settledHint = casinoWarPlugin.hint!(settledState);
    expect(settledHint).not.toBeNull();
    expect(settledHint!.selector).toBe('[data-testid="hint-target-casino-war-deal"]');

    // Unknown phase: should return null
    const unknownState = { ...fresh, phase: "unknown" } as unknown as CasinoWarState;
    expect(casinoWarPlugin.hint!(unknownState)).toBeNull();
  });
});
