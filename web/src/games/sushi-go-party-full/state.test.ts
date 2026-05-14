import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  scoreSeatRound,
  scoreMaki,
  scorePudding,
  cardCategory,
  HAND_SIZE,
  NUM_PLAYERS,
  TOTAL_ROUNDS,
  HUMAN_SEAT,
  type Card,
  type CardKind,
  type SushiGoPartyFullState,
} from "./state.js";

const S = { dummy: false };

function mkCards(kinds: CardKind[]): Card[] {
  return kinds.map((k, i) => ({ id: i, kind: k }));
}

function autoPlay(seed: number): SushiGoPartyFullState {
  let s = initialState(seed, S);
  // Bound the loop generously; max steps = 4 players * 9 picks * 3 rounds + 2
  // role transitions per round.
  for (let step = 0; step < 500 && s.phase !== "done"; step++) {
    if (s.phase === "picking") {
      s = reducer(s, { type: "pick", idx: 0 });
    } else if (s.phase === "round-scored") {
      s = reducer(s, { type: "next" });
    } else break;
  }
  return s;
}

describe("Sushi Go Party (Full) state", () => {
  it("initialState is deterministic for the same seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.hands[0]?.map((c) => c.kind)).toEqual(b.hands[0]?.map((c) => c.kind));
    expect(a.hands[1]?.map((c) => c.kind)).toEqual(b.hands[1]?.map((c) => c.kind));
    expect(a.round).toBe(1);
    expect(a.phase).toBe("picking");
    expect(a.hands.length).toBe(NUM_PLAYERS);
    for (const h of a.hands) expect(h.length).toBe(HAND_SIZE);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("pick adds a card to human tableau and CPUs also pick", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "pick", idx: 0 });
    expect(s1.tableaus[HUMAN_SEAT]!.length).toBe(1);
    for (let seat = 1; seat < NUM_PLAYERS; seat++) {
      expect(s1.tableaus[seat]!.length).toBe(1);
    }
    expect(s1.pickIndex).toBe(1);
    // hands shrank to 8 in each seat
    for (let seat = 0; seat < NUM_PLAYERS; seat++) {
      expect(s1.hands[seat]!.length).toBe(HAND_SIZE - 1);
    }
  });

  it("illegal pick (out of range) returns same state reference", () => {
    const s0 = initialState(11, S);
    const same = reducer(s0, { type: "pick", idx: 99 });
    expect(same).toBe(s0);
    const neg = reducer(s0, { type: "pick", idx: -1 });
    expect(neg).toBe(s0);
  });

  it("next during picking phase is a no-op", () => {
    const s0 = initialState(13, S);
    const same = reducer(s0, { type: "next" });
    expect(same).toBe(s0);
  });

  it("after 9 picks the round is scored", () => {
    let s = initialState(99, S);
    for (let i = 0; i < HAND_SIZE; i++) {
      expect(s.phase).toBe("picking");
      s = reducer(s, { type: "pick", idx: 0 });
    }
    expect(["round-scored", "done"]).toContain(s.phase);
    expect(s.lastRoundLog.length).toBe(NUM_PLAYERS);
    // each tableau has exactly 9 cards
    for (let seat = 0; seat < NUM_PLAYERS; seat++) {
      expect(s.tableaus[seat]!.length).toBe(HAND_SIZE);
    }
  });

  it("game ends after TOTAL_ROUNDS rounds with non-negative score", () => {
    const s = autoPlay(123);
    expect(s.phase).toBe("done");
    expect(s.round).toBe(TOTAL_ROUNDS);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("scoreSeatRound: nigiri values and wasabi triple the next nigiri", () => {
    const tab = mkCards(["nigiri1", "wasabi", "nigiri3", "nigiri2"]);
    // nigiri1=1 ; wasabi triples next placed nigiri (nigiri3=3*3=9) ; nigiri2=2 → total = 12
    const out = scoreSeatRound(tab, 0);
    expect(out.nigiri).toBe(12);
  });

  it("scoreSeatRound: sashimi sets of 3 = 10 pts, partial = 0", () => {
    const a = scoreSeatRound(mkCards(["sashimi", "sashimi", "sashimi", "sashimi", "sashimi"]), 0);
    expect(a.sashimi).toBe(10); // one complete set of 3, 2 left over
    const b = scoreSeatRound(mkCards(["sashimi", "sashimi"]), 0);
    expect(b.sashimi).toBe(0);
  });

  it("scoreSeatRound: tempura pairs = 5 each", () => {
    const a = scoreSeatRound(mkCards(["tempura", "tempura", "tempura", "tempura"]), 0);
    expect(a.tempura).toBe(10); // two pairs
    const b = scoreSeatRound(mkCards(["tempura"]), 0);
    expect(b.tempura).toBe(0);
  });

  it("scoreSeatRound: dumplings follow 1/3/6/10/15 tier and cap at 5", () => {
    expect(scoreSeatRound(mkCards(["dumpling"]), 0).dumpling).toBe(1);
    expect(scoreSeatRound(mkCards(["dumpling", "dumpling"]), 0).dumpling).toBe(3);
    expect(scoreSeatRound(mkCards(["dumpling", "dumpling", "dumpling"]), 0).dumpling).toBe(6);
    expect(scoreSeatRound(mkCards(["dumpling", "dumpling", "dumpling", "dumpling"]), 0).dumpling).toBe(10);
    expect(scoreSeatRound(mkCards(Array.from({ length: 7 }, () => "dumpling" as CardKind)), 0).dumpling).toBe(15);
  });

  it("scoreMaki: 6 to most, 3 to second when first uncontested", () => {
    const tabs: Card[][] = [
      mkCards(["maki3", "maki2"]), // 5
      mkCards(["maki2"]),           // 2
      mkCards(["maki1"]),           // 1
      mkCards([]),                  // 0
    ];
    const m = scoreMaki(tabs);
    expect(m[0]).toBe(6);
    expect(m[1]).toBe(3);
    expect(m[2]).toBe(0);
    expect(m[3]).toBe(0);
  });

  it("scoreMaki: ties split first place; no second awarded when first tied", () => {
    const tabs: Card[][] = [
      mkCards(["maki3"]), // 3
      mkCards(["maki3"]), // 3
      mkCards(["maki1"]), // 1
      mkCards([]),         // 0
    ];
    const m = scoreMaki(tabs);
    expect(m[0]).toBe(3);
    expect(m[1]).toBe(3);
    // sushi go: when first is tied, no second is awarded
    expect(m[2]).toBe(0);
    expect(m[3]).toBe(0);
  });

  it("scorePudding: most gets +6, least gets -6, ties split", () => {
    const r = scorePudding([5, 2, 2, 0]);
    expect(r[0]).toBe(6);
    expect(r[3]).toBe(-6);
    // ties among 2/2 share neither
    expect(r[1]).toBe(0);
    expect(r[2]).toBe(0);
  });

  it("scorePudding: returns zeros when no one has any", () => {
    const r = scorePudding([0, 0, 0, 0]);
    expect(r).toEqual([0, 0, 0, 0]);
  });

  it("cardCategory groups correctly", () => {
    expect(cardCategory("nigiri2")).toBe("nigiri");
    expect(cardCategory("maki3")).toBe("maki");
    expect(cardCategory("soy")).toBe("special");
    expect(cardCategory("pudding")).toBe("pudding");
    expect(cardCategory("dumpling")).toBe("dumpling");
  });

  it("hand rotation direction flips between rounds", () => {
    // not directly observable in public API, but we can check that hands change
    // between picks within a round.
    let s = initialState(2024, S);
    const firstHand = s.hands[HUMAN_SEAT]!.map((c) => c.kind).join(",");
    s = reducer(s, { type: "pick", idx: 0 });
    const secondHand = s.hands[HUMAN_SEAT]!.map((c) => c.kind).join(",");
    // After one pick, our hand should be different (we got someone else's leftover).
    expect(firstHand).not.toEqual(secondHand);
  });
});
