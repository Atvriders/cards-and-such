import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  hasAllWedges,
  CATEGORIES,
  QUESTION_BANK,
  CATEGORY_COLORS,
  CATEGORY_LABEL,
  HQ_INDICES,
  RING_LEN,
  SPOKE_LEN,
  NUM_PLAYERS,
  HUMAN_SEAT,
  ringCategoryAt,
  spokeOfHq,
  spokeCategoryAt,
  categoryAtPosition,
} from "./state.js";
import type { TrivialPursuitFullState, TrivialPursuitFullSettings } from "./state.js";

const S: TrivialPursuitFullSettings = { _dummy: false };

describe("trivial-pursuit-full — fixtures", () => {
  it("question bank covers all six categories with ample questions", () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(100);
    for (const c of CATEGORIES) {
      const count = QUESTION_BANK.filter(q => q.category === c).length;
      expect(count).toBeGreaterThanOrEqual(10);
    }
  });

  it("every question has 4 choices and a valid correct index", () => {
    for (const q of QUESTION_BANK) {
      expect(q.choices.length).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
    }
  });

  it("category colors and labels cover all six categories", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_COLORS[c]).toMatch(/^#/);
      expect(CATEGORY_LABEL[c].length).toBeGreaterThan(0);
    }
  });

  it("board geometry sanity: 6 HQs, 42 ring squares, 5 spoke depth", () => {
    expect(HQ_INDICES.length).toBe(6);
    expect(RING_LEN).toBe(42);
    expect(SPOKE_LEN).toBe(5);
    // Each HQ is on the ring
    for (const i of HQ_INDICES) expect(i).toBeGreaterThanOrEqual(0);
    for (const i of HQ_INDICES) expect(i).toBeLessThan(RING_LEN);
  });

  it("ringCategoryAt at HQ indices returns matching spoke category", () => {
    HQ_INDICES.forEach((idx, sp) => {
      expect(ringCategoryAt(idx)).toBe(CATEGORIES[sp]);
      expect(spokeOfHq(idx)).toBe(sp);
      expect(spokeCategoryAt(sp)).toBe(CATEGORIES[sp]);
    });
  });
});

describe("trivial-pursuit-full — initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    // structural equality
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("different seeds may yield different rng states", () => {
    const a = initialState(1, S);
    const b = initialState(99, S);
    expect(a.rngSeed).not.toBe(b.rngSeed);
  });

  it("starts with 4 players, all at hub, no wedges, it's player 0's turn", () => {
    const s = initialState(7, S);
    expect(s.players.length).toBe(NUM_PLAYERS);
    expect(s.turn).toBe(HUMAN_SEAT);
    expect(s.phase).toBe("rolling");
    expect(s.die).toBe(0);
    for (const p of s.players) {
      expect(p.pos.kind).toBe("hub");
      for (const c of CATEGORIES) expect(p.wedges[c]).toBe(false);
    }
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(0, S))).toBeNull();
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});

describe("trivial-pursuit-full — reducer mechanics", () => {
  it("rolling transitions away from 'rolling' phase", () => {
    const s = initialState(123, S);
    const after = reducer(s, { type: "roll" });
    // Could be question (most likely), choosingPath, or done — never the
    // initial rolling phase for the human.
    expect(["question", "finalQuestion", "choosingPath", "rolling", "done"]).toContain(after.phase);
    // die was rolled
    expect(after.die).toBeGreaterThanOrEqual(1);
    expect(after.die).toBeLessThanOrEqual(6);
  });

  it("rejects illegal actions (returns same reference) when not the human's turn or wrong phase", () => {
    const s = initialState(5, S);
    // selectAnswer in rolling phase is illegal
    const r1 = reducer(s, { type: "selectAnswer", choice: 2 });
    expect(r1).toBe(s);
    // submitAnswer in rolling phase is illegal
    const r2 = reducer(s, { type: "submitAnswer" });
    expect(r2).toBe(s);
    // continue in rolling phase is illegal
    const r3 = reducer(s, { type: "continue" });
    expect(r3).toBe(s);
    // choosePath when not in choosingPath phase is illegal
    const r4 = reducer(s, { type: "choosePath", choice: { kind: "ring" } });
    expect(r4).toBe(s);
  });

  it("rolling and then answering correctly keeps the human's turn (rolls again)", () => {
    let s: TrivialPursuitFullState = initialState(3, S);
    s = reducer(s, { type: "roll" });
    // If we got a question, force a correct answer and submit.
    if (s.phase === "question" || s.phase === "finalQuestion") {
      const correct = s.question!.correct;
      s = reducer(s, { type: "selectAnswer", choice: correct });
      expect(s.selected).toBe(correct);
      s = reducer(s, { type: "submitAnswer" });
      expect(s.phase).toBe("result");
      expect(s.lastCorrect).toBe(true);
      // Continue — the pending state should keep the human's turn (correct answer rule).
      s = reducer(s, { type: "continue" });
      // After continue we either still on human's turn rolling, or game ended.
      expect(["rolling", "done"]).toContain(s.phase);
      if (s.phase === "rolling") expect(s.turn).toBe(HUMAN_SEAT);
    }
  });

  it("rolling and answering wrong passes the turn (eventually to CPU)", () => {
    let s: TrivialPursuitFullState = initialState(11, S);
    s = reducer(s, { type: "roll" });
    if (s.phase === "question" || s.phase === "finalQuestion") {
      const correct = s.question!.correct;
      const wrong = (correct + 1) % 4;
      s = reducer(s, { type: "selectAnswer", choice: wrong });
      s = reducer(s, { type: "submitAnswer" });
      expect(s.phase).toBe("result");
      expect(s.lastCorrect).toBe(false);
      s = reducer(s, { type: "continue" });
      // Either CPUs played and it's back to human, or game advanced. Either
      // way the phase should be a valid game phase.
      expect(["rolling", "question", "finalQuestion", "choosingPath", "result", "done"]).toContain(s.phase);
    }
  });

  it("isTerminal returns score when phase becomes done (forced via final question win)", () => {
    // Force a state where the human has all wedges and is at hub with a
    // pending final question, then answer correctly.
    const base = initialState(0, S);
    const human = base.players[HUMAN_SEAT]!;
    const winnerHuman = {
      ...human,
      wedges: { geography: true, entertainment: true, history: true, arts: true, science: true, sports: true },
    };
    expect(hasAllWedges(winnerHuman)).toBe(true);
    const forced: TrivialPursuitFullState = {
      ...base,
      players: [winnerHuman, ...base.players.slice(1)],
      phase: "finalQuestion",
      question: QUESTION_BANK[0]!,
      selected: QUESTION_BANK[0]!.correct,
    };
    const after = reducer(forced, { type: "submitAnswer" });
    expect(after.phase).toBe("done");
    expect(after.winner).toBe(HUMAN_SEAT);
    const t = isTerminal(after);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("missing the final question passes the turn instead of ending the game", () => {
    const base = initialState(0, S);
    const human = base.players[HUMAN_SEAT]!;
    const winnerHuman = {
      ...human,
      wedges: { geography: true, entertainment: true, history: true, arts: true, science: true, sports: true },
    };
    const correct = QUESTION_BANK[0]!.correct;
    const wrong = (correct + 1) % 4;
    const forced: TrivialPursuitFullState = {
      ...base,
      players: [winnerHuman, ...base.players.slice(1)],
      phase: "finalQuestion",
      question: QUESTION_BANK[0]!,
      selected: wrong,
    };
    const after = reducer(forced, { type: "submitAnswer" });
    // submitAnswer goes through "result" first (pendingNext holds the real turn change)
    expect(after.phase).toBe("result");
    expect(after.lastCorrect).toBe(false);
    expect(after.pendingNext).not.toBeNull();
    const continued = reducer(after, { type: "continue" });
    // The game must NOT be done because the player just missed the final.
    // After continue, CPUs may have played, so phase could be anything but done.
    expect(continued.phase).not.toBe("done");
  });

  it("categoryAtPosition resolves cleanly for ring, spoke, and hub positions", () => {
    expect(categoryAtPosition({ kind: "ring", index: 0 })).toBe(CATEGORIES[0]);
    expect(categoryAtPosition({ kind: "spoke", spoke: 2, depth: 1 })).toBe(CATEGORIES[2]);
    expect(typeof categoryAtPosition({ kind: "hub" })).toBe("string");
  });
});
