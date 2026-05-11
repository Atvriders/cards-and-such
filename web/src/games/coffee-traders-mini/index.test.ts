import { describe, it, expect } from "vitest";
import { coffeeTradersMiniPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("coffee-traders-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coffeeTradersMiniPlugin.id).toBe("coffee-traders-mini");
    expect(coffeeTradersMiniPlugin.title).toBe("Coffee Traders Mini");
    expect(coffeeTradersMiniPlugin.category).toBe("board");
    expect(coffeeTradersMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coffeeTradersMiniPlugin.description).toBe("string");
    expect(coffeeTradersMiniPlugin.description.length).toBeGreaterThan(0);
    expect(coffeeTradersMiniPlugin.settings).toBeDefined();
    expect(typeof coffeeTradersMiniPlugin.settings).toBe("object");
    expect(typeof coffeeTradersMiniPlugin.initialState).toBe("function");
    expect(typeof coffeeTradersMiniPlugin.reducer).toBe("function");
    expect(typeof coffeeTradersMiniPlugin.isTerminal).toBe("function");
    expect(coffeeTradersMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = coffeeTradersMiniPlugin.initialState(42, S);
    const b = coffeeTradersMiniPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(coffeeTradersMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    expect(typeof coffeeTradersMiniPlugin.hint).toBe("function");
    const fresh = coffeeTradersMiniPlugin.initialState(7, S);
    const result = coffeeTradersMiniPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-coffee-traders-mini-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force the non-"choosing" branch to hit the `null` return.
    const resolved = { ...fresh, phase: "resolved" as const };
    expect(coffeeTradersMiniPlugin.hint!(resolved)).toBeNull();
    const done = { ...fresh, phase: "done" as const };
    expect(coffeeTradersMiniPlugin.hint!(done)).toBeNull();
    expect(coffeeTradersMiniPlugin.isTerminal(done)).not.toBeNull();
  });
});
