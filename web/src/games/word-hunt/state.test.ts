import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("word-hunt", () => {
  it("initialState picks a category with 30+ words", () => {
    const s = initialState(1);
    expect(s.category.words.length).toBeGreaterThanOrEqual(30);
    expect(s.timeLeft).toBe(90);
    expect(s.phase).toBe("playing");
  });

  it("valid category word is accepted", () => {
    let s = initialState(2);
    const word = s.category.words[0]!;
    s = reducer(s, { type: "type", text: word });
    s = reducer(s, { type: "submit" });
    expect(s.found).toContain(word);
    expect(s.score).toBeGreaterThan(0);
  });

  it("duplicate word is rejected", () => {
    let s = initialState(3);
    const word = s.category.words[0]!;
    s = reducer(s, { type: "type", text: word });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "type", text: word });
    s = reducer(s, { type: "submit" });
    expect(s.lastMessage).toMatch(/already/i);
    expect(s.found.filter(w => w === word)).toHaveLength(1);
  });

  it("word not in category is rejected", () => {
    let s = initialState(4);
    s = reducer(s, { type: "type", text: "XYZZY" });
    s = reducer(s, { type: "submit" });
    expect(s.lastMessage).toContain("not in this category");
    expect(s.found).toHaveLength(0);
  });

  it("tick ends game at zero", () => {
    let s = initialState(5);
    for (let i = 0; i < 90; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
