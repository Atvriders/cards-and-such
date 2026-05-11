import { describe, it, expect } from "vitest";
import { codenamesXxlPlugin } from "./index.js";
import type { CodenamesXxlState, CodenamesXxlSettings } from "./state.js";

const S: CodenamesXxlSettings = { dummy: false };

describe("codenames-xxl plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(codenamesXxlPlugin.id).toBe("codenames-xxl");
    expect(codenamesXxlPlugin.title).toBe("Codenames XXL");
    expect(codenamesXxlPlugin.category).toBe("board");
    expect(codenamesXxlPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof codenamesXxlPlugin.description).toBe("string");
    expect(codenamesXxlPlugin.description.length).toBeGreaterThan(0);
    expect(codenamesXxlPlugin.settings).toBeDefined();
    expect(codenamesXxlPlugin.settings.dummy.kind).toBe("boolean");
    expect(codenamesXxlPlugin.settings.dummy.default).toBe(false);
    expect(typeof codenamesXxlPlugin.initialState).toBe("function");
    expect(typeof codenamesXxlPlugin.reducer).toBe("function");
    expect(typeof codenamesXxlPlugin.isTerminal).toBe("function");
    expect(typeof codenamesXxlPlugin.hint).toBe("function");
    expect(codenamesXxlPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = codenamesXxlPlugin.initialState(42, S);
    const b = codenamesXxlPlugin.initialState(42, S);
    // Same seed -> identical answer and current vectors
    expect(a.answer.join(",")).toBe(b.answer.join(","));
    expect(a.current.join(",")).toBe(b.current.join(","));
    // Config-driven shape: answerLength 5 from CodenamesXxl_CFG
    expect(a.answer.length).toBe(5);
    expect(a.current.length).toBe(5);
    expect(a.guesses).toEqual([]);
    expect(a.phase).toBe("guess");
    // Fresh state must not be terminal
    expect(codenamesXxlPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget during guess phase and null when terminal", () => {
    const state = codenamesXxlPlugin.initialState(7, S);
    const target = codenamesXxlPlugin.hint!(state);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector.length).toBeGreaterThan(0);
      expect(target.pulses).toBe(3);
    }

    // Force non-guess phases to exercise the null branch of hint().
    const won: CodenamesXxlState = { ...state, phase: "won" };
    expect(codenamesXxlPlugin.hint!(won)).toBeNull();
    const lost: CodenamesXxlState = { ...state, phase: "lost" };
    expect(codenamesXxlPlugin.hint!(lost)).toBeNull();
  });
});
