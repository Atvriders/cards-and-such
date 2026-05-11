import { describe, it, expect } from "vitest";
import { agramPlugin } from "./index.js";
import type { AgramState } from "./state.js";

const S = {} as never;

describe("agram plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(agramPlugin.id).toBe("agram");
    expect(agramPlugin.title).toBe("Agram");
    expect(agramPlugin.category).toBe("cards");
    expect(agramPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof agramPlugin.description).toBe("string");
    expect(agramPlugin.description.length).toBeGreaterThan(0);
    expect(agramPlugin.settings).toBeDefined();
    expect(typeof agramPlugin.settings).toBe("object");
    expect(typeof agramPlugin.initialState).toBe("function");
    expect(typeof agramPlugin.reducer).toBe("function");
    expect(typeof agramPlugin.isTerminal).toBe("function");
    expect(agramPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = agramPlugin.initialState(42, S);
    const b = agramPlugin.initialState(42, S);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.hands).toHaveLength(2);
    expect(a.hands[0]).toHaveLength(5);
    expect(a.hands[1]).toHaveLength(5);
    expect(agramPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing on player's turn, and null otherwise", () => {
    expect(typeof agramPlugin.hint).toBe("function");
    const fresh = agramPlugin.initialState(7, S);
    const result = agramPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-agram-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Phase done -> null
    const doneState: AgramState = { ...fresh, phase: "done" };
    expect(agramPlugin.hint!(doneState)).toBeNull();

    // Not player's turn -> null
    const botTurn: AgramState = { ...fresh, turn: 1 };
    expect(agramPlugin.hint!(botTurn)).toBeNull();

    // isTerminal on done state returns score object
    const finishedWin: AgramState = { ...fresh, phase: "done", lastTrickWinner: 0 };
    expect(agramPlugin.isTerminal(finishedWin)).toEqual({ score: 100 });
    const finishedLoss: AgramState = { ...fresh, phase: "done", lastTrickWinner: 1 };
    expect(agramPlugin.isTerminal(finishedLoss)).toEqual({ score: 0 });
  });
});
