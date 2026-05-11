import { describe, it, expect } from "vitest";
import { bigThreeCasPlugin } from "./index.js";
import type { BigThreeCasState } from "./state.js";

const S = { questions: "10" } as const;

describe("big-three-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bigThreeCasPlugin.id).toBe("big-three-cas");
    expect(bigThreeCasPlugin.title).toBe("Big Three");
    expect(bigThreeCasPlugin.category).toBe("cards");
    expect(bigThreeCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bigThreeCasPlugin.description).toBe("string");
    expect(bigThreeCasPlugin.description.length).toBeGreaterThan(0);
    expect(bigThreeCasPlugin.settings).toBeDefined();
    expect(typeof bigThreeCasPlugin.settings).toBe("object");
    expect(typeof bigThreeCasPlugin.initialState).toBe("function");
    expect(typeof bigThreeCasPlugin.reducer).toBe("function");
    expect(typeof bigThreeCasPlugin.isTerminal).toBe("function");
    expect(bigThreeCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bigThreeCasPlugin.initialState(42, S);
    const b = bigThreeCasPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.questions.length).toBe(10);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(bigThreeCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for actionable phases and null otherwise", () => {
    expect(typeof bigThreeCasPlugin.hint).toBe("function");
    const fresh = bigThreeCasPlugin.initialState(7, S);

    // playing with no selection -> no hint
    expect(bigThreeCasPlugin.hint!(fresh)).toBeNull();

    // playing with selection -> submit hint
    const selected: BigThreeCasState = { ...fresh, selected: 1 };
    const selectedHint = bigThreeCasPlugin.hint!(selected);
    expect(selectedHint).not.toBeNull();
    expect(selectedHint!.selector).toBe('[data-testid="hint-target-big-three-cas-submit"]');
    expect(selectedHint!.pulses).toBe(3);

    // result phase -> next hint
    const resulted: BigThreeCasState = { ...fresh, phase: "result", submitted: true, selected: 1 };
    const resultHint = bigThreeCasPlugin.hint!(resulted);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-big-three-cas-next"]');
    expect(resultHint!.pulses).toBe(3);

    // done phase -> terminal w/ score
    const done: BigThreeCasState = { ...fresh, phase: "done" };
    expect(bigThreeCasPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
