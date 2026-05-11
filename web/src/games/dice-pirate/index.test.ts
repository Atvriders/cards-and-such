import { describe, it, expect } from "vitest";
import { dicePiratePlugin } from "./index.js";
import type { DicePirateState } from "./state.js";

const S = { dummy: false } as const;

describe("dice-pirate plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePiratePlugin.id).toBe("dice-pirate");
    expect(dicePiratePlugin.title).toBe("Dice Pirate");
    expect(dicePiratePlugin.category).toBe("dice");
    expect(dicePiratePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePiratePlugin.description).toBe("string");
    expect(dicePiratePlugin.description.length).toBeGreaterThan(0);
    expect(dicePiratePlugin.settings).toBeDefined();
    expect(typeof dicePiratePlugin.settings).toBe("object");
    expect(typeof dicePiratePlugin.initialState).toBe("function");
    expect(typeof dicePiratePlugin.reducer).toBe("function");
    expect(typeof dicePiratePlugin.isTerminal).toBe("function");
    expect(dicePiratePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = dicePiratePlugin.initialState(42, S);
    const b = dicePiratePlugin.initialState(42, S);
    expect(a.ships.length).toBe(6);
    expect(a.current).toBe(0);
    expect(a.rolls).toBeNull();
    expect(a.hp).toBe(6);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("fire");
    const aSig = a.ships.map((s) => `${s.name}:${s.def}:${s.reward}:${s.sunk}`).join("|");
    const bSig = b.ships.map((s) => `${s.name}:${s.def}:${s.reward}:${s.sunk}`).join("|");
    expect(aSig).toBe(bSig);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(dicePiratePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof dicePiratePlugin.hint).toBe("function");

    // Fresh state: phase "fire" -> roll hint.
    const fireState = dicePiratePlugin.initialState(7, S);
    const fireHint = dicePiratePlugin.hint!(fireState);
    expect(fireHint).not.toBeNull();
    expect(fireHint!.selector).toBe('[data-testid="hint-target-dice-pirate-roll"]');
    expect(fireHint!.pulses).toBe(3);

    // Synthesised result phase -> next hint.
    const resultState: DicePirateState = { ...fireState, phase: "result" };
    const resultHint = dicePiratePlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-pirate-next"]');
    expect(resultHint!.pulses).toBe(3);

    // Terminal state -> null hint and terminal payload exposes score.
    const doneState: DicePirateState = { ...fireState, phase: "done", score: 99 };
    expect(dicePiratePlugin.hint!(doneState)).toBeNull();
    expect(dicePiratePlugin.isTerminal(doneState)).toEqual({ score: 99 });
  });
});
