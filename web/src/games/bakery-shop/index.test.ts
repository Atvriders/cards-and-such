import { describe, it, expect } from "vitest";
import { bakeryShopPlugin } from "./index.js";

describe("bakeryShopPlugin", () => {
  it("has the expected plugin shape", () => {
    const p = bakeryShopPlugin as any;
    expect(p.id).toBe("bakery-shop");
    expect(typeof p.title).toBe("string");
    expect(p.title.length).toBeGreaterThan(0);
    expect(typeof p.category).toBe("string");
    expect(typeof p.initialState).toBe("function");
    expect(typeof p.reducer).toBe("function");
    expect(typeof p.isTerminal).toBe("function");
    expect(typeof p.hint).toBe("function");
    expect(p.component).toBeDefined();
    expect(p.players).toBeDefined();
    expect(p.players.min).toBe(1);
    expect(p.players.max).toBe(1);
  });

  it("produces a deterministic initial state and isTerminal returns null initially", () => {
    const p = bakeryShopPlugin as any;
    const a = p.initialState(42);
    const b = p.initialState(42);
    expect(a).toEqual(b);
    expect(a.day).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.phase).toBe("plan");
    expect(a.ovenLevel).toBe(0);
    expect(p.isTerminal(a)).toBeNull();

    const done = { ...a, phase: "done" };
    const term = p.isTerminal(done);
    expect(term).not.toBeNull();
    expect(typeof term.score).toBe("number");
  });

  it("hint returns a HintTarget while playing and null when finished", () => {
    const p = bakeryShopPlugin as any;
    const s = p.initialState(7);
    const h = p.hint(s);
    expect(h).not.toBeNull();
    expect(h).toHaveProperty("selector");
    expect(typeof h.selector).toBe("string");

    const finished = { ...s, phase: "done" };
    expect(p.hint(finished)).toBeNull();
  });
});
