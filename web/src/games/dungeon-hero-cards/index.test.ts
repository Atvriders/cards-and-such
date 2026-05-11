import { describe, it, expect } from "vitest";
import { dungeonHeroCardsPlugin } from "./index.js";

const S = { dummy: false };

describe("dungeonHeroCardsPlugin", () => {
  it("exposes the expected plugin shape with callable functions", () => {
    expect(dungeonHeroCardsPlugin.id).toBe("dungeon-hero-cards");
    expect(dungeonHeroCardsPlugin.title).toBe("Dungeon Hero: Card Crawl");
    expect(dungeonHeroCardsPlugin.category).toBe("board");
    expect(dungeonHeroCardsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(dungeonHeroCardsPlugin.settings).toBeDefined();
    expect(dungeonHeroCardsPlugin.settings.dummy.kind).toBe("boolean");
    expect(typeof dungeonHeroCardsPlugin.initialState).toBe("function");
    expect(typeof dungeonHeroCardsPlugin.reducer).toBe("function");
    expect(typeof dungeonHeroCardsPlugin.isTerminal).toBe("function");
    expect(typeof dungeonHeroCardsPlugin.hint).toBe("function");
    expect(dungeonHeroCardsPlugin.component).toBeDefined();
  });

  it("produces a deterministic initial state in 'choose' phase that is not terminal", () => {
    const a = dungeonHeroCardsPlugin.initialState(42, S);
    const b = dungeonHeroCardsPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("choose");
    expect(a.index).toBe(0);
    expect(a.score).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.prompts.length).toBeGreaterThanOrEqual(10);
    expect(dungeonHeroCardsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null after phase changes", () => {
    const s0 = dungeonHeroCardsPlugin.initialState(7, S);
    const h0 = dungeonHeroCardsPlugin.hint!(s0);
    expect(h0).not.toBeNull();
    expect(h0!.selector).toBe('[data-testid="hint-target-dungeon-hero-cards-primary"]');
    expect(h0!.pulses).toBe(3);

    // After choosing, phase becomes "result" — hint should be null
    const s1 = dungeonHeroCardsPlugin.reducer(s0, { type: "choose", choice: 0 });
    expect(s1.phase).toBe("result");
    expect(dungeonHeroCardsPlugin.hint!(s1)).toBeNull();
  });
});
