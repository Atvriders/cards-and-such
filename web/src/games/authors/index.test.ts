import { describe, it, expect } from "vitest";
import { authorsPlugin } from "./index.js";
import type { AuthorsState } from "./state.js";

const S = { dummy: false } as never;

describe("authors plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(authorsPlugin.id).toBe("authors");
    expect(authorsPlugin.title).toBe("Authors");
    expect(authorsPlugin.category).toBe("cards");
    expect(authorsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof authorsPlugin.description).toBe("string");
    expect(authorsPlugin.description.length).toBeGreaterThan(0);
    expect(typeof authorsPlugin.howToPlay).toBe("string");
    expect(authorsPlugin.settings).toBeDefined();
    expect(typeof authorsPlugin.settings).toBe("object");
    expect(typeof authorsPlugin.initialState).toBe("function");
    expect(typeof authorsPlugin.reducer).toBe("function");
    expect(typeof authorsPlugin.isTerminal).toBe("function");
    expect(authorsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = authorsPlugin.initialState(123, S);
    const b = authorsPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(123);
    expect(a.round).toBe(1);
    expect(a.you).toBe(7);
    expect(a.cpu).toBe(7);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.pts).toBe(0);
    expect(a.result).toBe("");
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(authorsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when phase is ready and null otherwise", () => {
    expect(typeof authorsPlugin.hint).toBe("function");
    const ready = authorsPlugin.initialState(7, S);
    const readyHint = authorsPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-authors-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const scored: AuthorsState = { ...ready, phase: "scored" };
    expect(authorsPlugin.hint!(scored)).toBeNull();

    const done: AuthorsState = { ...ready, phase: "done" };
    expect(authorsPlugin.hint!(done)).toBeNull();
    expect(authorsPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
