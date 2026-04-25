import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { speed: "normal" as const };

describe("initialState", () => {
  it("starts with 3 orders", () => {
    const s = initialState(42, def);
    expect(s.queue.filter(o => !o.done && !o.failed).length).toBe(3);
  });

  it("score and served start at 0", () => {
    const s = initialState(42, def);
    expect(s.score).toBe(0);
    expect(s.served).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("all orders have valid size, type", () => {
    const s = initialState(42, def);
    const sizes = new Set(["S", "M", "L"]);
    const types = new Set(["espresso", "latte", "cappuccino", "americano"]);
    s.queue.forEach(o => {
      expect(sizes.has(o.size)).toBe(true);
      expect(types.has(o.type)).toBe(true);
    });
  });
});

describe("reducer — selections", () => {
  it("set-size updates current.size", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "set-size", size: "L" });
    expect(s2.current.size).toBe("L");
  });

  it("set-type updates current.type", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "set-type", drink: "latte" });
    expect(s2.current.type).toBe("latte");
  });

  it("set-extra updates current.extra", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "set-extra", extra: "sugar" });
    expect(s2.current.extra).toBe("sugar");
  });
});

describe("reducer — serve", () => {
  it("cannot serve without size and type", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "serve" });
    expect(s2).toBe(s);
  });

  it("correct serve increases score", () => {
    const s = initialState(42, def);
    const target = s.queue.filter(o => !o.done && !o.failed)[0]!;
    let state = reducer(s, { type: "set-size", size: target.size });
    state = reducer(state, { type: "set-type", drink: target.type });
    state = reducer(state, { type: "set-extra", extra: target.extra });
    state = reducer(state, { type: "serve" });
    expect(state.score).toBeGreaterThan(0);
    expect(state.served).toBe(1);
  });

  it("wrong serve marks failed and score=0", () => {
    const s = initialState(42, def);
    const target = s.queue.filter(o => !o.done && !o.failed)[0]!;
    // Pick wrong size deliberately
    const wrongSize = target.size === "S" ? "L" : "S";
    let state = reducer(s, { type: "set-size", size: wrongSize });
    state = reducer(state, { type: "set-type", drink: target.type });
    state = reducer(state, { type: "serve" });
    expect(state.score).toBe(0);
    expect(state.failed).toBe(1);
  });
});

describe("reducer — tick", () => {
  it("decrements order timers", () => {
    const s = initialState(42, def);
    const firstTime = s.queue[0]!.timeLeft;
    const s2 = reducer(s, { type: "tick" });
    expect(s2.queue[0]!.timeLeft).toBe(firstTime - 1);
  });

  it("ends game after maxTick", () => {
    const s = { ...initialState(42, def), tick: 89 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 350 };
    expect(isTerminal(s)!.score).toBe(350);
  });
});
