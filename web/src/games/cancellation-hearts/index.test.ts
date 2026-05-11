import { describe, it, expect } from "vitest";
import { cancellationHeartsPlugin } from "./index.js";
import type { CancellationHeartsState } from "./state.js";

const S = {} as never;

describe("cancellation-hearts plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cancellationHeartsPlugin.id).toBe("cancellation-hearts");
    expect(cancellationHeartsPlugin.title).toBe("Cancellation Hearts");
    expect(cancellationHeartsPlugin.category).toBe("cards");
    expect(cancellationHeartsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cancellationHeartsPlugin.description).toBe("string");
    expect(cancellationHeartsPlugin.description.length).toBeGreaterThan(0);
    expect(cancellationHeartsPlugin.settings).toBeDefined();
    expect(typeof cancellationHeartsPlugin.settings).toBe("object");
    expect(typeof cancellationHeartsPlugin.initialState).toBe("function");
    expect(typeof cancellationHeartsPlugin.reducer).toBe("function");
    expect(typeof cancellationHeartsPlugin.isTerminal).toBe("function");
    expect(cancellationHeartsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cancellationHeartsPlugin.initialState(42, S);
    const b = cancellationHeartsPlugin.initialState(42, S);
    const aPlayerIds = a.playerHand.map((c) => c.id).join("|");
    const bPlayerIds = b.playerHand.map((c) => c.id).join("|");
    const aBotIds = a.botHand.map((c) => c.id).join("|");
    const bBotIds = b.botHand.map((c) => c.id).join("|");
    expect(aPlayerIds).toBe(bPlayerIds);
    expect(aBotIds).toBe(bBotIds);
    expect(a.phase).toBe("playing");
    expect(a.playerTricks).toBe(0);
    expect(a.botTricks).toBe(0);
    expect(a.playerHand.length).toBe(13);
    expect(a.botHand.length).toBe(13);
    expect(cancellationHeartsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null on a terminal state", () => {
    expect(typeof cancellationHeartsPlugin.hint).toBe("function");
    const state = cancellationHeartsPlugin.initialState(7, S);
    const result = cancellationHeartsPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("cancellation-hearts");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const terminal: CancellationHeartsState = { ...state, phase: "done" };
    expect(cancellationHeartsPlugin.hint!(terminal)).toBeNull();
    const terminalScore = cancellationHeartsPlugin.isTerminal(terminal);
    expect(terminalScore).not.toBeNull();
    if (terminalScore !== null) {
      expect(typeof terminalScore.score).toBe("number");
    }
  });
});
