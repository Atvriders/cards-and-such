import { describe, it, expect } from "vitest";
import { chicagoDicePlugin } from "./index.js";
import type { ChicagoState } from "./state.js";

const S = { rounds: "11" as const };

describe("chicago-dice plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chicagoDicePlugin.id).toBe("chicago-dice");
    expect(chicagoDicePlugin.title).toBe("Chicago (Dice)");
    expect(chicagoDicePlugin.category).toBe("dice");
    expect(chicagoDicePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chicagoDicePlugin.description).toBe("string");
    expect(chicagoDicePlugin.description.length).toBeGreaterThan(0);
    expect(chicagoDicePlugin.settings).toBeDefined();
    expect(typeof chicagoDicePlugin.settings).toBe("object");
    expect(typeof chicagoDicePlugin.initialState).toBe("function");
    expect(typeof chicagoDicePlugin.reducer).toBe("function");
    expect(typeof chicagoDicePlugin.isTerminal).toBe("function");
    expect(chicagoDicePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = chicagoDicePlugin.initialState(42, S);
    const b = chicagoDicePlugin.initialState(42, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.roundIndex).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.rounds).toHaveLength(11);
    expect(a.rounds[0]!.target).toBe(2);
    expect(a.rounds[10]!.target).toBe(12);
    expect(a.playerTotal).toBe(0);
    expect(a.botTotal).toBe(0);
    expect(a.winner).toBeNull();
    expect(chicagoDicePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null once gameOver flag is set", () => {
    expect(typeof chicagoDicePlugin.hint).toBe("function");
    const state = chicagoDicePlugin.initialState(7, S);
    const result = chicagoDicePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-chicago-dice-roll"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // hint() inspects `(state as any).gameOver` — set it to force the null branch.
    const finished = { ...(state as ChicagoState), gameOver: true } as ChicagoState & { gameOver: boolean };
    expect(chicagoDicePlugin.hint!(finished)).toBeNull();
  });
});
