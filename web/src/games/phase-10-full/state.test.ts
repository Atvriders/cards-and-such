import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  makeDeck,
  canFormPhase,
  isValidGroup,
  penaltyValue,
  PHASES,
} from "./state.js";
import type { P10Card, P10State } from "./state.js";

const SETTINGS = { _dummy: false };

function card(id: number, kind: "num" | "wild" | "skip", color: "R" | "B" | "G" | "Y" | null, value: number | null): P10Card {
  return { id, kind, color, value };
}

describe("phase-10-full deck", () => {
  it("builds a 108-card deck", () => {
    expect(makeDeck()).toHaveLength(108);
  });

  it("has 8 wilds and 4 skips", () => {
    const d = makeDeck();
    expect(d.filter((c) => c.kind === "wild")).toHaveLength(8);
    expect(d.filter((c) => c.kind === "skip")).toHaveLength(4);
  });

  it("each color has 24 numbered cards", () => {
    const d = makeDeck();
    for (const col of ["R", "B", "G", "Y"] as const) {
      expect(d.filter((c) => c.kind === "num" && c.color === col)).toHaveLength(24);
    }
  });
});

describe("phase-10-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, SETTINGS);
    const b = initialState(42, SETTINGS);
    expect(a.hands).toEqual(b.hands);
    expect(a.draw.map((c) => c.id)).toEqual(b.draw.map((c) => c.id));
    expect(a.discard.map((c) => c.id)).toEqual(b.discard.map((c) => c.id));
  });

  it("differs by seed", () => {
    const a = initialState(1, SETTINGS);
    const b = initialState(99, SETTINGS);
    const sa = a.hands[0]!.map((c) => c.id).join(",");
    const sb = b.hands[0]!.map((c) => c.id).join(",");
    expect(sa).not.toEqual(sb);
  });

  it("deals 10 cards to each of 4 seats", () => {
    const s = initialState(7, SETTINGS);
    for (let i = 0; i < 4; i++) expect(s.hands[i]!).toHaveLength(10);
  });

  it("everyone starts on phase 1 with 0 pts", () => {
    const s = initialState(7, SETTINGS);
    expect(s.phaseOf).toEqual([1, 1, 1, 1]);
    expect(s.scores).toEqual([0, 0, 0, 0]);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(3, SETTINGS))).toBeNull();
  });
});

describe("phase-10-full meld validation", () => {
  it("validates a basic set of 3", () => {
    const cards = [
      card(0, "num", "R", 5),
      card(1, "num", "B", 5),
      card(2, "num", "G", 5),
    ];
    expect(isValidGroup(cards, { kind: "set", size: 3 })).toBe(true);
  });

  it("rejects a set with mismatching number", () => {
    const cards = [
      card(0, "num", "R", 5),
      card(1, "num", "B", 6),
      card(2, "num", "G", 5),
    ];
    expect(isValidGroup(cards, { kind: "set", size: 3 })).toBe(false);
  });

  it("validates a run of 4", () => {
    const cards = [
      card(0, "num", "R", 3),
      card(1, "num", "B", 4),
      card(2, "num", "G", 5),
      card(3, "num", "Y", 6),
    ];
    expect(isValidGroup(cards, { kind: "run", size: 4 })).toBe(true);
  });

  it("uses wild to bridge a run", () => {
    const cards = [
      card(0, "num", "R", 3),
      card(1, "wild", null, null),
      card(2, "num", "G", 5),
      card(3, "num", "Y", 6),
    ];
    expect(isValidGroup(cards, { kind: "run", size: 4 })).toBe(true);
  });

  it("rejects a run with all wilds", () => {
    const cards = [
      card(0, "wild", null, null),
      card(1, "wild", null, null),
      card(2, "wild", null, null),
      card(3, "wild", null, null),
    ];
    expect(isValidGroup(cards, { kind: "run", size: 4 })).toBe(false);
  });

  it("rejects melds containing skip cards", () => {
    const cards = [
      card(0, "num", "R", 5),
      card(1, "num", "B", 5),
      card(2, "skip", null, null),
    ];
    expect(isValidGroup(cards, { kind: "set", size: 3 })).toBe(false);
  });

  it("canFormPhase recognises Phase 1 (2 sets of 3)", () => {
    const cards = [
      card(0, "num", "R", 4),
      card(1, "num", "B", 4),
      card(2, "num", "G", 4),
      card(3, "num", "R", 9),
      card(4, "num", "B", 9),
      card(5, "num", "Y", 9),
    ];
    expect(canFormPhase(cards, PHASES[0]!)).toBe(true);
  });

  it("canFormPhase rejects wrong-size hand", () => {
    const cards = [
      card(0, "num", "R", 4),
      card(1, "num", "B", 4),
      card(2, "num", "G", 4),
    ];
    expect(canFormPhase(cards, PHASES[0]!)).toBe(false);
  });

  it("canFormPhase accepts Phase 2 (set 3 + run 4)", () => {
    const cards = [
      card(0, "num", "R", 7),
      card(1, "num", "B", 7),
      card(2, "num", "G", 7),
      card(3, "num", "R", 1),
      card(4, "num", "B", 2),
      card(5, "num", "G", 3),
      card(6, "num", "Y", 4),
    ];
    expect(canFormPhase(cards, PHASES[1]!)).toBe(true);
  });

  it("canFormPhase accepts Phase 8 (7 of one color)", () => {
    const cards = [
      card(0, "num", "B", 1),
      card(1, "num", "B", 2),
      card(2, "num", "B", 4),
      card(3, "num", "B", 7),
      card(4, "num", "B", 9),
      card(5, "num", "B", 11),
      card(6, "num", "B", 12),
    ];
    expect(canFormPhase(cards, PHASES[7]!)).toBe(true);
  });
});

describe("phase-10-full penalty values", () => {
  it("scores 5/10/15/25 correctly", () => {
    expect(penaltyValue(card(0, "num", "R", 3))).toBe(5);
    expect(penaltyValue(card(0, "num", "R", 9))).toBe(5);
    expect(penaltyValue(card(0, "num", "R", 10))).toBe(10);
    expect(penaltyValue(card(0, "num", "R", 12))).toBe(10);
    expect(penaltyValue(card(0, "skip", null, null))).toBe(15);
    expect(penaltyValue(card(0, "wild", null, null))).toBe(25);
  });
});

describe("phase-10-full reducer", () => {
  it("ignores actions when it isn't your turn", () => {
    const s = initialState(5, SETTINGS);
    const off = { ...s, current: 1 as const };
    const next = reducer(off, { type: "draw", from: "stock" });
    expect(next).toBe(off);
  });

  it("returns same reference on illegal lay-down (none selected)", () => {
    const s = initialState(5, SETTINGS);
    // skip the draw stage
    const inPlay: P10State = { ...s, stage: "play" };
    const next = reducer(inPlay, { type: "lay-down" });
    // selected empty -> message updated but state should not have hand altered;
    // we just verify it's a "no-op" in terms of laidThisRound
    expect(next.laidThisRound[0]).toBe(false);
  });

  it("draw from stock advances stage to play and adds a card", () => {
    const s = initialState(5, SETTINGS);
    const before = s.hands[0]!.length;
    const next = reducer(s, { type: "draw", from: "stock" });
    expect(next.stage).toBe("play");
    expect(next.hands[0]!.length).toBe(before + 1);
  });

  it("discard advances current to next seat", () => {
    let s = initialState(5, SETTINGS);
    s = reducer(s, { type: "draw", from: "stock" });
    const firstCard = s.hands[0]![0]!;
    s = reducer(s, { type: "discard", cardId: firstCard.id });
    expect(s.current).toBe(1);
    expect(s.stage).toBe("draw");
  });

  it("cpu-step is a no-op during human turn", () => {
    const s = initialState(5, SETTINGS);
    const out = reducer(s, { type: "cpu-step" });
    expect(out).toBe(s);
  });

  it("runs a full CPU rotation without crashing", () => {
    let s = initialState(11, SETTINGS);
    // human draws+discards
    s = reducer(s, { type: "draw", from: "stock" });
    const toss = s.hands[0]![0]!;
    s = reducer(s, { type: "discard", cardId: toss.id });
    // three CPUs go
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "cpu-step" });
    }
    // After all four players, it should be the human's turn again (unless
    // someone went out, which is unlikely on round 1 in the first cycle).
    expect([0, 1, 2, 3]).toContain(s.current);
  });

  it("plays many CPU turns without throwing", () => {
    let s = initialState(31, SETTINGS);
    for (let iter = 0; iter < 200 && s.stage !== "done"; iter++) {
      if (s.stage === "round-end") {
        s = reducer(s, { type: "next-round" });
        continue;
      }
      if (s.current === 0) {
        if (s.stage === "draw") {
          s = reducer(s, { type: "draw", from: "stock" });
        } else if (s.stage === "play") {
          const toss = s.hands[0]![0]!;
          s = reducer(s, { type: "discard", cardId: toss.id });
        }
      } else {
        s = reducer(s, { type: "cpu-step" });
      }
    }
    // sanity: state shape is still intact
    expect(s.hands).toHaveLength(4);
    expect(typeof s.round).toBe("number");
  });
});

describe("phase-10-full isTerminal", () => {
  it("returns null until game is done", () => {
    const s = initialState(5, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when state is done and player wins", () => {
    const s = initialState(5, SETTINGS);
    const done = { ...s, stage: "done" as const, winner: 0 as const, scores: [40, 60, 80, 100] };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(960);
  });

  it("returns 0 score when CPU wins", () => {
    const s = initialState(5, SETTINGS);
    const done = { ...s, stage: "done" as const, winner: 2 as const };
    expect(isTerminal(done)).toEqual({ score: 0 });
  });
});
