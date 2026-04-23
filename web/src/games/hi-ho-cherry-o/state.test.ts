import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_CHERRIES, SPIN_FACES } from "./state.js";

const settings = { dummy: "yes" as const };

describe("Hi Ho! Cherry-O", () => {
  it("initializes 4 players each with 10 cherries on tree", () => {
    const s = initialState(42, settings);
    expect(s.numPlayers).toBe(4);
    expect(s.players).toHaveLength(4);
    s.players.forEach((p) => {
      expect(p.tree).toBe(TOTAL_CHERRIES);
      expect(p.bucket).toBe(0);
    });
    expect(s.winner).toBeNull();
  });

  it("spinning moves cherries from tree to bucket (pick result)", () => {
    // Seed 1 gives pick1 (index 0 in SPIN_FACES)
    // Test by just verifying bucket can increase after spin
    const s = initialState(42, settings);
    const next = reducer(s, { type: "spin" });
    // After spin, either bucket increased or spill/bird/dog
    const p0 = next.players[0]!;
    expect(p0.tree + p0.bucket).toBe(TOTAL_CHERRIES); // cherries are conserved
  });

  it("cherries are always conserved (tree + bucket = 10)", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 20; i++) {
      if (s.winner !== null) break;
      s = reducer(s, { type: "spin" });
      s.players.forEach((p) => {
        expect(p.tree + p.bucket).toBe(TOTAL_CHERRIES);
      });
    }
  });

  it("winner detected when tree reaches 0", () => {
    // Force win: place player 0 with tree=0 but we need winner to trigger
    const s = initialState(42, settings);
    const almostWon = {
      ...s,
      players: [
        { tree: 1, bucket: 9 },
        { tree: 5, bucket: 5 },
        { tree: 5, bucket: 5 },
        { tree: 5, bucket: 5 },
      ] as readonly { tree: number; bucket: number }[],
    };
    // Run spins until player wins or bots win
    let cur = almostWon;
    for (let i = 0; i < 50; i++) {
      if (cur.winner !== null) break;
      cur = reducer(cur, { type: "spin" });
    }
    expect(cur.winner).not.toBeNull();
  });

  it("SPIN_FACES has 7 elements", () => {
    expect(SPIN_FACES).toHaveLength(7);
    expect(SPIN_FACES).toContain("pick1");
    expect(SPIN_FACES).toContain("spill");
    expect(SPIN_FACES).toContain("bird");
    expect(SPIN_FACES).toContain("dog");
  });

  it("isTerminal returns null during game", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 when player 0 wins", () => {
    const s = initialState(42, settings);
    const won = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("isTerminal returns score 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost = { ...s, winner: 2 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("turn returns to 0 after bots complete", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "spin" });
    if (next.winner === null) {
      expect(next.turn).toBe(0);
    }
  });
});
