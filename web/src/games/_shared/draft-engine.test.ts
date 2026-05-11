import { describe, expect, it } from "vitest";
import {
  DEFAULT_DRAFT_CONFIG,
  type DraftCard,
  type DraftConfig,
  draftFinalScore,
  draftIsTerminal,
  draftReducer,
  initialDraftState,
  tableauScore,
} from "./draft-engine.js";

describe("draft-engine", () => {
  it("tableauScore sums ranks and applies suit-set + rank-pair bonuses", () => {
    const cfg: DraftConfig = {
      ...DEFAULT_DRAFT_CONFIG,
      suitBonus: [{ count: 3, pts: 10 }],
      rankBonus: [{ count: 2, pts: 5 }],
    };
    // Three suit-0 cards (triggers suit bonus 10), with rank 7 appearing
    // twice (triggers rank-pair bonus 5). Sum of ranks = 7+7+3 = 17.
    const t: DraftCard[] = [
      { id: 1, rank: 7, suit: 0 },
      { id: 2, rank: 7, suit: 0 },
      { id: 3, rank: 3, suit: 0 },
    ];
    expect(tableauScore(t, cfg)).toBe(17 + 10 + 5);
    // Empty tableau scores 0.
    expect(tableauScore([], cfg)).toBe(0);
  });

  it("draftReducer runs a full game to terminal and draftFinalScore rewards a win", () => {
    // Single round, tiny offer so we can deterministically pick the highest.
    const cfg: DraftConfig = {
      ...DEFAULT_DRAFT_CONFIG,
      rounds: 1,
      offerSize: 2,
      suitBonus: [],
      rankBonus: [],
      winBonus: 25,
    };
    const s0 = initialDraftState(12345, cfg);
    expect(s0.phase).toBe("drafting");
    expect(s0.offer.length).toBe(2);

    // Player picks the higher-ranked card; CPU takes the remaining one.
    const myIdx = (s0.offer[0]!.rank >= s0.offer[1]!.rank) ? 0 : 1;
    const myRank = s0.offer[myIdx]!.rank;
    const cpuRank = s0.offer[1 - myIdx]!.rank;

    const s1 = draftReducer(s0, { type: "pick", idx: myIdx });
    expect(s1.phase).toBe("done");
    expect(s1.myScore).toBe(myRank);
    expect(s1.cpuScore).toBe(cpuRank);

    // Terminal detection + win bonus when player out-scored CPU (or ties to 0 bonus).
    const term = draftIsTerminal(s1);
    expect(term).not.toBeNull();
    const expectedBonus = myRank > cpuRank ? 25 : 0;
    expect(draftFinalScore(s1)).toBe(myRank + expectedBonus);
    expect(term!.score).toBe(draftFinalScore(s1));
  });

  it("draftReducer ignores out-of-range picks and actions in wrong phase", () => {
    const s0 = initialDraftState(42);
    // Out-of-range index is a no-op.
    expect(draftReducer(s0, { type: "pick", idx: 999 })).toBe(s0);
    expect(draftReducer(s0, { type: "pick", idx: -1 })).toBe(s0);
    // "next" while drafting is a no-op.
    expect(draftReducer(s0, { type: "next" })).toBe(s0);

    // Make a legal pick, then verify a second "pick" in round-done phase is ignored.
    const s1 = draftReducer(s0, { type: "pick", idx: 0 });
    expect(s1.phase === "round-done" || s1.phase === "done").toBe(true);
    if (s1.phase === "round-done") {
      const s1b = draftReducer(s1, { type: "pick", idx: 0 });
      expect(s1b).toBe(s1);
      // "next" should advance the round and re-enter drafting.
      const s2 = draftReducer(s1, { type: "next" });
      expect(s2.phase).toBe("drafting");
      expect(s2.round).toBe(s1.round + 1);
      expect(s2.offer.length).toBe(s0.config.offerSize);
    }
  });
});
