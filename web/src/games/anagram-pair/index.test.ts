import { describe, it, expect } from "vitest";
import { anagramPairPlugin, anagramPairSettings } from "./index.js";

const S = { pairCount: "6" } as const;

describe("anagram-pair plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(anagramPairPlugin.id).toBe("anagram-pair");
    expect(anagramPairPlugin.title).toBe("Anagram Pair");
    expect(anagramPairPlugin.category).toBe("board");
    expect(anagramPairPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof anagramPairPlugin.description).toBe("string");
    expect(anagramPairPlugin.description.length).toBeGreaterThan(0);
    expect(anagramPairPlugin.settings).toBe(anagramPairSettings);
    expect(typeof anagramPairPlugin.initialState).toBe("function");
    expect(typeof anagramPairPlugin.reducer).toBe("function");
    expect(typeof anagramPairPlugin.isTerminal).toBe("function");
    expect(anagramPairPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = anagramPairPlugin.initialState(42, S);
    const b = anagramPairPlugin.initialState(42, S);
    expect(a.leftItems.join("|")).toBe(b.leftItems.join("|"));
    expect(a.rightItems.join("|")).toBe(b.rightItems.join("|"));
    expect(a.pairs.map((p) => p.word).join(",")).toBe(b.pairs.map((p) => p.word).join(","));
    expect(a.pairs).toHaveLength(6);
    expect(a.leftItems).toHaveLength(6);
    expect(a.rightItems).toHaveLength(6);
    expect(a.score).toBe(0);
    expect(a.attempts).toBe(0);
    expect(a.done).toBe(false);
    expect(anagramPairPlugin.isTerminal(a)).toBeNull();

    const finished = { ...a, done: true, score: 60 };
    expect(anagramPairPlugin.isTerminal(finished)).toEqual({ score: 60 });
  });

  it("hint returns null in non-DOM environment (or a valid HintTarget when DOM is present)", () => {
    expect(typeof anagramPairPlugin.hint).toBe("function");
    const state = anagramPairPlugin.initialState(5, S);
    const result = anagramPairPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".ap-grid");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
