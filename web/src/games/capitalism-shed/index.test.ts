import { describe, it, expect } from "vitest";
import { capitalismShedPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("capitalism-shed plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(capitalismShedPlugin.id).toBe("capitalism-shed");
    expect(capitalismShedPlugin.title).toBe("Capitalism");
    expect(capitalismShedPlugin.category).toBe("cards");
    expect(capitalismShedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof capitalismShedPlugin.description).toBe("string");
    expect(capitalismShedPlugin.description.length).toBeGreaterThan(0);
    expect(capitalismShedPlugin.settings).toBeDefined();
    expect(typeof capitalismShedPlugin.settings).toBe("object");
    expect(typeof capitalismShedPlugin.initialState).toBe("function");
    expect(typeof capitalismShedPlugin.reducer).toBe("function");
    expect(typeof capitalismShedPlugin.isTerminal).toBe("function");
    expect(capitalismShedPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = capitalismShedPlugin.initialState(123, S);
    const b = capitalismShedPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(capitalismShedPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for ready/scored phases and null when done", () => {
    expect(typeof capitalismShedPlugin.hint).toBe("function");
    const ready = capitalismShedPlugin.initialState(7, S);
    const readyHint = capitalismShedPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-capitalism-shed-play"]');
    expect(readyHint!.pulses).toBe(3);

    const scoredHint = capitalismShedPlugin.hint!({ ...ready, phase: "scored" });
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-capitalism-shed-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneHint = capitalismShedPlugin.hint!({ ...ready, phase: "done" });
    expect(doneHint).toBeNull();
    expect(capitalismShedPlugin.isTerminal({ ...ready, phase: "done", score: 99 })).toEqual({ score: 99 });
  });
});
