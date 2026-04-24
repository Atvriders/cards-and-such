import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const med = { difficulty: "medium" as const };

describe("initialState", () => {
  it("creates 15 balls, all un-pocketed", () => {
    const s = initialState(1, med);
    expect(s.balls.length).toBe(15);
    expect(s.balls.every((b) => !b.pocketed)).toBe(true);
  });

  it("starts as player turn, pick phase", () => {
    const s = initialState(1, med);
    expect(s.currentTurn).toBe("player");
    expect(s.phase).toBe("pick");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(42, med);
    const s2 = initialState(42, med);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — pick ball", () => {
  it("picking a ball moves to aim phase", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "pick-ball", ballId: 1 });
    expect(s2.phase).toBe("aim");
    expect(s2.targetBall).toBe(1);
  });

  it("cannot pick 8-ball before clearing group balls", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "pick-ball", ballId: 8 });
    expect(s2.phase).toBe("pick"); // no change
    expect(s2.targetBall).toBeNull();
  });

  it("cannot pick pocketed ball", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "pick-ball", ballId: 1 });
    const s3 = reducer(s2, { type: "shoot" }); // may or may not sink
    // Try picking the same ball again after possible pocket
    const alreadySunk = s3.balls.find((b) => b.id === 1)?.pocketed ?? false;
    if (alreadySunk) {
      const s4 = reducer(s3, { type: "pick-ball", ballId: 1 });
      expect(s4.targetBall !== 1 || s4.phase !== "aim").toBe(true);
    }
  });
});

describe("reducer — shooting", () => {
  it("shooting results in 'result' phase or re-picks on miss", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "pick-ball", ballId: 3 });
    const s3 = reducer(s2, { type: "shoot" });
    expect(["result", "pick", "done"]).toContain(s3.phase);
  });

  it("sets angle and power", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "pick-ball", ballId: 1 });
    const s3 = reducer(s2, { type: "set-angle", value: 0.3 });
    expect(s3.angle).toBeCloseTo(0.3);
    const s4 = reducer(s3, { type: "set-power", value: 0.8 });
    expect(s4.power).toBeCloseTo(0.8);
  });

  it("no-op after game over", () => {
    const s = initialState(1, med);
    const won = { ...s, winner: "player" as const };
    const s2 = reducer(won, { type: "pick-ball", ballId: 1 });
    expect(s2).toBe(won);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, med);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 1000 when player wins", () => {
    const s = { ...initialState(1, med), winner: "player" as const };
    expect(isTerminal(s)?.score).toBe(1000);
  });

  it("returns score 0 when bot wins", () => {
    const s = { ...initialState(1, med), winner: "bot" as const };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
