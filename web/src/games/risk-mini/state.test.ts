import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, N_TERR } from "./state.js";

const S = { dummy: false };

describe("risk-mini", () => {
  it("starts with 5 territories, player owns 3", () => {
    const s = initialState(1, S);
    expect(s.armies.length).toBe(N_TERR);
    expect(s.owner.filter(o => o === "p").length).toBe(3);
    expect(s.owner.filter(o => o === "c").length).toBe(2);
  });
  it("selecting attacker advances phase", () => {
    const s = reducer(initialState(1, S), { type: "select", idx: 0 });
    expect(s.phase).toBe("select-target");
    expect(s.selected).toBe(0);
  });
  it("score is non-negative", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 200; i++) {
      if (s.phase === "select-attacker") s = reducer(s, { type: "end" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("eventually terminates", () => {
    let s = initialState(7, S);
    for (let i = 0; i < 500; i++) {
      if (s.phase === "select-attacker") {
        const myStrong = s.owner.map((o, j) => ({ o, j, a: s.armies[j]! })).filter(x => x.o === "p" && x.a >= 2).sort((a, b) => b.a - a.a)[0];
        if (myStrong) s = reducer(s, { type: "select", idx: myStrong.j });
        else s = reducer(s, { type: "end" });
      } else if (s.phase === "select-target") {
        const enemy = s.owner.findIndex(o => o === "c");
        if (enemy >= 0) s = reducer(s, { type: "select", idx: enemy });
        else s = reducer(s, { type: "end" });
      } else if (s.phase === "resolve") s = reducer(s, { type: "attack" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
