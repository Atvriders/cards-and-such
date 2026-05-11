import { describe, it, expect } from "vitest";
import { cardAdventureMiniPlugin } from "./index.js";
import type { CardAdventureMiniSettings } from "./state.js";
import { TOTAL_ROUNDS } from "./state.js";

const S: CardAdventureMiniSettings = { dummy: false };

describe("cardAdventureMiniPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardAdventureMiniPlugin.id).toBe("card-adventure-mini");
    expect(cardAdventureMiniPlugin.title).toBe("Card Adventure Mini");
    expect(cardAdventureMiniPlugin.category).toBe("board");
    expect(cardAdventureMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardAdventureMiniPlugin.description).toBe("string");
    expect(cardAdventureMiniPlugin.description.length).toBeGreaterThan(0);
    expect(cardAdventureMiniPlugin.settings).toBeDefined();
    expect(cardAdventureMiniPlugin.settings.dummy.kind).toBe("boolean");
    expect(cardAdventureMiniPlugin.settings.dummy.default).toBe(false);
    expect(typeof cardAdventureMiniPlugin.initialState).toBe("function");
    expect(typeof cardAdventureMiniPlugin.reducer).toBe("function");
    expect(typeof cardAdventureMiniPlugin.isTerminal).toBe("function");
    expect(typeof cardAdventureMiniPlugin.hint).toBe("function");
    expect(cardAdventureMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cardAdventureMiniPlugin.initialState(42, S);
    const b = cardAdventureMiniPlugin.initialState(42, S);
    const c = cardAdventureMiniPlugin.initialState(43, S);
    expect(a.rounds.length).toBe(TOTAL_ROUNDS);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first question text
    expect(b.rounds[0]!.question).toBe(a.rounds[0]!.question);
    // each round has exactly 4 choices and a valid correct index
    for (const r of a.rounds) {
      expect(r.choices.length).toBe(4);
      expect(r.correct).toBeGreaterThanOrEqual(0);
      expect(r.correct).toBeLessThanOrEqual(3);
      expect(r.choices[r.correct]).toBeDefined();
    }
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.rounds.every((r, i) => r.question === c.rounds[i]!.question);
    expect(sameOrder).toBe(false);
    expect(cardAdventureMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = cardAdventureMiniPlugin.initialState(7, S);
    const target = cardAdventureMiniPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-card-adventure-mini-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(cardAdventureMiniPlugin.hint!(done)).toBeNull();
    expect(cardAdventureMiniPlugin.isTerminal(done)).toEqual({ score: 0 });

    const result = { ...playing, phase: "result" as const };
    expect(cardAdventureMiniPlugin.hint!(result)).toBeNull();
  });
});
