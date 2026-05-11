import { describe, it, expect } from "vitest";
import { aceFiveTripleDrawPlugin } from "./index.js";
import type { AceFiveTripleDrawState } from "./state.js";

const S = { dummy: false } as never;

describe("ace-five-triple-draw plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceFiveTripleDrawPlugin.id).toBe("ace-five-triple-draw");
    expect(aceFiveTripleDrawPlugin.title).toBe("A-5 Triple Draw Solo");
    expect(aceFiveTripleDrawPlugin.category).toBe("cards");
    expect(aceFiveTripleDrawPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceFiveTripleDrawPlugin.description).toBe("string");
    expect(aceFiveTripleDrawPlugin.description.length).toBeGreaterThan(0);
    expect(typeof aceFiveTripleDrawPlugin.howToPlay).toBe("string");
    expect(aceFiveTripleDrawPlugin.settings).toBeDefined();
    expect(typeof aceFiveTripleDrawPlugin.settings).toBe("object");
    expect(typeof aceFiveTripleDrawPlugin.initialState).toBe("function");
    expect(typeof aceFiveTripleDrawPlugin.reducer).toBe("function");
    expect(typeof aceFiveTripleDrawPlugin.isTerminal).toBe("function");
    expect(aceFiveTripleDrawPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aceFiveTripleDrawPlugin.initialState(123, S);
    const b = aceFiveTripleDrawPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(aceFiveTripleDrawPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on deal/scored phases and null when terminal", () => {
    expect(typeof aceFiveTripleDrawPlugin.hint).toBe("function");

    const dealState = aceFiveTripleDrawPlugin.initialState(7, S);
    const dealHint = aceFiveTripleDrawPlugin.hint!(dealState);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-ace-five-triple-draw-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scoredState: AceFiveTripleDrawState = { ...dealState, phase: "scored" };
    const scoredHint = aceFiveTripleDrawPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-ace-five-triple-draw-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: AceFiveTripleDrawState = { ...dealState, phase: "done" };
    expect(aceFiveTripleDrawPlugin.hint!(doneState)).toBeNull();
  });
});
