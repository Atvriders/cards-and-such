import { describe, it, expect } from "vitest";
import { aceAlleyPlugin } from "./index.js";
import type { AceAlleyState } from "./state.js";

const S = { dummy: false } as const;

describe("ace-alley plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceAlleyPlugin.id).toBe("ace-alley");
    expect(aceAlleyPlugin.title).toBe("Ace Alley");
    expect(aceAlleyPlugin.category).toBe("cards");
    expect(aceAlleyPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceAlleyPlugin.description).toBe("string");
    expect(aceAlleyPlugin.description.length).toBeGreaterThan(0);
    expect(aceAlleyPlugin.settings).toBeDefined();
    expect(typeof aceAlleyPlugin.settings).toBe("object");
    expect(typeof aceAlleyPlugin.initialState).toBe("function");
    expect(typeof aceAlleyPlugin.reducer).toBe("function");
    expect(typeof aceAlleyPlugin.isTerminal).toBe("function");
    expect(aceAlleyPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aceAlleyPlugin.initialState(1234, S);
    const b = aceAlleyPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.draw).toBe(1);
    expect(a.lastCard).toBeNull();
    expect(a.isAce).toBe(false);
    expect(a.aces).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("drawing");
    expect(aceAlleyPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when drawing and null otherwise", () => {
    expect(typeof aceAlleyPlugin.hint).toBe("function");
    const drawing = aceAlleyPlugin.initialState(7, S);
    const drawHint = aceAlleyPlugin.hint!(drawing);
    expect(drawHint).not.toBeNull();
    expect(drawHint!.selector).toBe('[data-testid="hint-target-ace-alley-primary"]');
    expect(drawHint!.pulses).toBe(3);

    const notDrawing: AceAlleyState = { ...drawing, phase: "result" };
    expect(aceAlleyPlugin.hint!(notDrawing)).toBeNull();

    const done: AceAlleyState = { ...drawing, phase: "done" };
    expect(aceAlleyPlugin.hint!(done)).toBeNull();
  });
});
