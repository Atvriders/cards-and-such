import { describe, it, expect } from "vitest";
import { cardStadiumFansPlugin } from "./index.js";
import type { CardStadiumFansState } from "./state.js";

const S = { dummy: false } as never;

describe("card-stadium-fans plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardStadiumFansPlugin.id).toBe("card-stadium-fans");
    expect(cardStadiumFansPlugin.title).toBe("Card Stadium Fans");
    expect(cardStadiumFansPlugin.category).toBe("cards");
    expect(cardStadiumFansPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardStadiumFansPlugin.description).toBe("string");
    expect(cardStadiumFansPlugin.description.length).toBeGreaterThan(0);
    expect(cardStadiumFansPlugin.settings).toBeDefined();
    expect(typeof cardStadiumFansPlugin.settings).toBe("object");
    expect(typeof cardStadiumFansPlugin.initialState).toBe("function");
    expect(typeof cardStadiumFansPlugin.reducer).toBe("function");
    expect(typeof cardStadiumFansPlugin.isTerminal).toBe("function");
    expect(cardStadiumFansPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardStadiumFansPlugin.initialState(42, S);
    const b = cardStadiumFansPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.drawCount).toBe(0);
    expect(a.score).toBe(0);
    expect(a.card).toBeNull();
    expect(a.history).toEqual([]);
    expect(a.phase).toBe("drawing");
    expect(a.rngSeed).toBe(42);
    expect(cardStadiumFansPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardStadiumFansPlugin.hint).toBe("function");
    const state = cardStadiumFansPlugin.initialState(7, S);
    const result = cardStadiumFansPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-stadium-fans-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const terminal: CardStadiumFansState = { ...state, phase: "done" };
    expect(cardStadiumFansPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardStadiumFansPlugin.hint!(terminal)).toBeNull();
  });
});
