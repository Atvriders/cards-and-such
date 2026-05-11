import { describe, it, expect } from "vitest";
import { courtPieceRangPlugin } from "./index.js";
import type { CourtPieceRangState } from "./state.js";

const S = { dummy: false } as never;

describe("court-piece-rang plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(courtPieceRangPlugin.id).toBe("court-piece-rang");
    expect(courtPieceRangPlugin.title).toBe("Court Piece (Rang)");
    expect(courtPieceRangPlugin.category).toBe("cards");
    expect(courtPieceRangPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof courtPieceRangPlugin.description).toBe("string");
    expect(courtPieceRangPlugin.description.length).toBeGreaterThan(0);
    expect(courtPieceRangPlugin.settings).toBeDefined();
    expect(typeof courtPieceRangPlugin.settings).toBe("object");
    expect(typeof courtPieceRangPlugin.initialState).toBe("function");
    expect(typeof courtPieceRangPlugin.reducer).toBe("function");
    expect(typeof courtPieceRangPlugin.isTerminal).toBe("function");
    expect(courtPieceRangPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = courtPieceRangPlugin.initialState(42, S);
    const b = courtPieceRangPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.wins).toBe(0);
    expect(a.losses).toBe(0);
    expect(courtPieceRangPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on ready/scored phases and null otherwise", () => {
    expect(typeof courtPieceRangPlugin.hint).toBe("function");
    const ready = courtPieceRangPlugin.initialState(7, S);
    const readyHint = courtPieceRangPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(typeof readyHint!.selector).toBe("string");
    expect(readyHint!.selector.length).toBeGreaterThan(0);
    expect(readyHint!.selector).toContain("court-piece-rang");
    if (readyHint!.pulses !== undefined) {
      expect(typeof readyHint!.pulses).toBe("number");
      expect(readyHint!.pulses).toBeGreaterThan(0);
    }

    const scored: CourtPieceRangState = { ...ready, phase: "scored" };
    const scoredHint = courtPieceRangPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toContain("court-piece-rang");

    const done: CourtPieceRangState = { ...ready, phase: "done" };
    expect(courtPieceRangPlugin.hint!(done)).toBeNull();
    expect(courtPieceRangPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
