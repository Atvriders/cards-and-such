import { describe, it, expect } from "vitest";
import { cardTowerStackPlugin } from "./index.js";
import type { CardTowerStackSettings } from "./state.js";

const S: CardTowerStackSettings = { dummy: false };

describe("cardTowerStackPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardTowerStackPlugin.id).toBe("card-tower-stack");
    expect(cardTowerStackPlugin.title).toBe("Card Tower Stack");
    expect(cardTowerStackPlugin.category).toBe("cards");
    expect(cardTowerStackPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardTowerStackPlugin.description).toBe("string");
    expect(cardTowerStackPlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardTowerStackPlugin.howToPlay).toBe("string");
    expect(cardTowerStackPlugin.settings).toBeDefined();
    expect(cardTowerStackPlugin.settings.dummy.kind).toBe("boolean");
    expect(cardTowerStackPlugin.settings.dummy.default).toBe(false);
    expect(typeof cardTowerStackPlugin.initialState).toBe("function");
    expect(typeof cardTowerStackPlugin.reducer).toBe("function");
    expect(typeof cardTowerStackPlugin.isTerminal).toBe("function");
    expect(typeof cardTowerStackPlugin.hint).toBe("function");
    expect(cardTowerStackPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cardTowerStackPlugin.initialState(42, S);
    const b = cardTowerStackPlugin.initialState(42, S);
    const c = cardTowerStackPlugin.initialState(43, S);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("draw");
    // same seed -> identical state object
    expect(b).toEqual(a);
    // different seed -> different rngSeed
    expect(c.rngSeed).toBe(43);
    expect(c.rngSeed).not.toBe(a.rngSeed);
    expect(cardTowerStackPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not terminal and null when done", () => {
    const fresh = cardTowerStackPlugin.initialState(7, S);
    const target = cardTowerStackPlugin.hint!(fresh);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-card-tower-stack-primary"]');
    expect(target!.pulses).toBe(3);

    const done = { ...fresh, phase: "done" as const, score: 100 };
    expect(cardTowerStackPlugin.hint!(done)).toBeNull();
    expect(cardTowerStackPlugin.isTerminal(done)).toEqual({ score: 100 });
  });
});
