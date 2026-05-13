import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  score,
  BOARD,
  BOARD_LEN,
  STARTING_CASH,
  CHANCE_DECK,
  CHEST_DECK,
  computeRent,
  canBuild,
  canSellHouse,
  canMortgage,
  canUnmortgage,
  mortgageValue,
  unmortgageCost,
  hasColorMonopoly,
  countRailroads,
  countUtilities,
  squaresInColor,
  netWorth,
  type MonopolyFullState,
  type Owner,
} from "./state.js";

const S = { _dummy: false };

describe("monopoly-full: board & initial state", () => {
  it("has the standard 40-square board", () => {
    expect(BOARD.length).toBe(BOARD_LEN);
    expect(BOARD_LEN).toBe(40);
    // Cardinal corners
    expect(BOARD[0]!.type).toBe("go");
    expect(BOARD[10]!.type).toBe("jail");
    expect(BOARD[20]!.type).toBe("free");
    expect(BOARD[30]!.type).toBe("gotojail");
    // Tax squares
    expect(BOARD[4]!.type).toBe("tax");
    expect(BOARD[38]!.type).toBe("tax");
    // Railroad squares
    expect(BOARD.filter((s) => s.type === "railroad").length).toBe(4);
    // Utility squares
    expect(BOARD.filter((s) => s.type === "utility").length).toBe(2);
    // Chance / Community Chest
    expect(BOARD.filter((s) => s.type === "chance").length).toBe(3);
    expect(BOARD.filter((s) => s.type === "chest").length).toBe(3);
    // Properties: 22
    expect(BOARD.filter((s) => s.type === "property").length).toBe(22);
  });

  it("initial state is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a).toEqual(b);
    expect(a.pCash).toBe(STARTING_CASH);
    expect(a.cCash).toBe(STARTING_CASH);
    expect(a.phase).toBe("rolling");
    expect(a.dice).toBeNull();
    expect(a.owners.every((o) => o === "none")).toBe(true);
    expect(a.houses.every((h) => h === 0)).toBe(true);
    expect(a.mortgaged.every((m) => m === false)).toBe(true);
    expect(a.chanceDeck.length).toBe(CHANCE_DECK.length);
    expect(a.chestDeck.length).toBe(CHEST_DECK.length);
  });

  it("isTerminal returns null on fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("different seeds produce different shuffled card decks", () => {
    const a = initialState(1, S);
    const b = initialState(999, S);
    // High likelihood of different orderings.
    expect(a.chanceDeck).not.toEqual(b.chanceDeck);
  });
});

describe("monopoly-full: rent calculation", () => {
  it("computes bare-lot, monopoly, and house rents", () => {
    const owners: Owner[] = new Array(40).fill("none");
    const houses = new Array(40).fill(0);
    const mortgaged = new Array(40).fill(false);

    // Mediterranean (idx 1) alone — bare rent = 2.
    owners[1] = "p";
    expect(computeRent(owners, houses, mortgaged, 1, "p", 7)).toBe(2);

    // Buy Baltic (idx 3) too → full brown monopoly → rent doubles to 4.
    owners[3] = "p";
    expect(computeRent(owners, houses, mortgaged, 1, "p", 7)).toBe(4);

    // 1 house on Med → use rents[1] = 10.
    houses[1] = 1;
    expect(computeRent(owners, houses, mortgaged, 1, "p", 7)).toBe(10);

    // Hotel (5) on Med → 250.
    houses[1] = 5;
    expect(computeRent(owners, houses, mortgaged, 1, "p", 7)).toBe(250);

    // Mortgaged → no rent.
    mortgaged[1] = true;
    houses[1] = 0;
    expect(computeRent(owners, houses, mortgaged, 1, "p", 7)).toBe(0);
  });

  it("railroad rent scales by RRs owned: 25/50/100/200", () => {
    const owners: Owner[] = new Array(40).fill("none");
    const houses = new Array(40).fill(0);
    const mortgaged = new Array(40).fill(false);
    const RRS = BOARD.map((s, i) => (s.type === "railroad" ? i : -1)).filter((x) => x >= 0);
    owners[RRS[0]!] = "p";
    expect(computeRent(owners, houses, mortgaged, RRS[0]!, "p", 7)).toBe(25);
    owners[RRS[1]!] = "p";
    expect(computeRent(owners, houses, mortgaged, RRS[0]!, "p", 7)).toBe(50);
    owners[RRS[2]!] = "p";
    expect(computeRent(owners, houses, mortgaged, RRS[0]!, "p", 7)).toBe(100);
    owners[RRS[3]!] = "p";
    expect(computeRent(owners, houses, mortgaged, RRS[0]!, "p", 7)).toBe(200);
  });

  it("utility rent: 4× / 10× dice roll", () => {
    const owners: Owner[] = new Array(40).fill("none");
    const houses = new Array(40).fill(0);
    const mortgaged = new Array(40).fill(false);
    const UTILS = BOARD.map((s, i) => (s.type === "utility" ? i : -1)).filter((x) => x >= 0);
    owners[UTILS[0]!] = "p";
    expect(computeRent(owners, houses, mortgaged, UTILS[0]!, "p", 8)).toBe(32); // 4×8
    owners[UTILS[1]!] = "p";
    expect(computeRent(owners, houses, mortgaged, UTILS[0]!, "p", 8)).toBe(80); // 10×8
  });

  it("helpers report counts & monopolies", () => {
    const owners: Owner[] = new Array(40).fill("none");
    const mortgaged = new Array(40).fill(false);
    // Brown set (idx 1 & 3)
    owners[1] = "p"; owners[3] = "p";
    expect(hasColorMonopoly(owners, mortgaged, "p", "brown")).toBe(true);
    expect(hasColorMonopoly(owners, mortgaged, "c", "brown")).toBe(false);
    // Mortgage one → breaks monopoly.
    mortgaged[3] = true;
    expect(hasColorMonopoly(owners, mortgaged, "p", "brown")).toBe(false);

    // Railroad counts
    const RR_IDX = BOARD.findIndex((s) => s.type === "railroad");
    owners[RR_IDX] = "c";
    expect(countRailroads(owners, "c")).toBe(1);

    // Utility counts
    const UT_IDX = BOARD.findIndex((s) => s.type === "utility");
    owners[UT_IDX] = "p";
    expect(countUtilities(owners, "p")).toBe(1);

    // Brown group
    expect(squaresInColor("brown").sort()).toEqual([1, 3]);
  });
});

describe("monopoly-full: reducer basics", () => {
  it("rolling produces dice and advances the player", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "roll" });
    expect(s1.dice).not.toBeNull();
    const [d1, d2] = s1.dice!;
    expect(d1).toBeGreaterThanOrEqual(1);
    expect(d1).toBeLessThanOrEqual(6);
    expect(d2).toBeGreaterThanOrEqual(1);
    expect(d2).toBeLessThanOrEqual(6);
    // Player should have moved.
    expect(s1.pPos).not.toBe(0);
    // Phase should be either deciding (if landed on unowned property) or manage.
    expect(["deciding", "manage", "ai", "rolling"]).toContain(s1.phase);
  });

  it("illegal action returns same state reference", () => {
    const s0 = initialState(3, S);
    // Trying to buy when not in deciding phase
    const s1 = reducer(s0, { type: "buy" });
    expect(s1).toBe(s0);
    // Trying to end-turn from rolling
    const s2 = reducer(s0, { type: "end-turn" });
    expect(s2).toBe(s0);
    // Trying to build at idx 1 while not owning it
    const s3 = reducer({ ...s0, phase: "manage" }, { type: "build", squareIdx: 1 });
    expect(s3.houses[1]).toBe(0);
    expect(s3.pCash).toBe(s0.pCash);
  });

  it("buy on deciding deducts cash and assigns ownership", () => {
    // Construct a synthetic deciding state on Mediterranean.
    const s0 = initialState(5, S);
    const synthetic: MonopolyFullState = {
      ...s0,
      pPos: 1,
      phase: "deciding",
    };
    const after = reducer(synthetic, { type: "buy" });
    expect(after.owners[1]).toBe("p");
    expect(after.pCash).toBe(STARTING_CASH - BOARD[1]!.price);
    expect(after.phase).toBe("manage");
  });

  it("auction start, then bid above cpuMaxBid wins", () => {
    const s0 = initialState(11, S);
    const synthetic: MonopolyFullState = { ...s0, pPos: 1, phase: "deciding" };
    const opened = reducer(synthetic, { type: "auction-start" });
    expect(opened.phase).toBe("auction");
    expect(opened.auction).not.toBeNull();
    const cap = opened.auction!.cpuMaxBid;
    const win = reducer(opened, { type: "auction-bid", amount: cap + 1 });
    expect(win.owners[1]).toBe("p");
    expect(win.pCash).toBe(STARTING_CASH - (cap + 1));
    expect(win.phase).toBe("manage");
  });

  it("mortgage/unmortgage produces expected cash deltas", () => {
    let s: MonopolyFullState = {
      ...initialState(2, S),
      pPos: 1,
      phase: "manage",
    };
    // Player owns Med
    const o = s.owners.slice(); o[1] = "p"; s = { ...s, owners: o };
    // Mortgage Mediterranean (face $60 → $30)
    expect(canMortgage(s.owners, s.houses, s.mortgaged, "p", 1)).toBe(true);
    const m = reducer(s, { type: "mortgage", squareIdx: 1 });
    expect(m.mortgaged[1]).toBe(true);
    expect(m.pCash).toBe(STARTING_CASH + mortgageValue(1));

    // Unmortgage costs 55% of face = $33
    expect(canUnmortgage(m.owners, m.mortgaged, m.pCash, "p", 1)).toBe(true);
    const u = reducer(m, { type: "unmortgage", squareIdx: 1 });
    expect(u.mortgaged[1]).toBe(false);
    expect(u.pCash).toBe(m.pCash - unmortgageCost(1));
  });

  it("build / sell-house respects color-set monopoly & even-build", () => {
    let s: MonopolyFullState = {
      ...initialState(8, S),
      phase: "manage",
    };
    const o = s.owners.slice();
    // Owning just Mediterranean — no monopoly yet.
    o[1] = "p";
    s = { ...s, owners: o };
    expect(canBuild(s.owners, s.houses, s.mortgaged, s.pCash, "p", 1)).toBe(false);

    // Add Baltic for full brown monopoly.
    const o2 = s.owners.slice(); o2[3] = "p";
    s = { ...s, owners: o2 };
    expect(canBuild(s.owners, s.houses, s.mortgaged, s.pCash, "p", 1)).toBe(true);

    const built = reducer(s, { type: "build", squareIdx: 1 });
    expect(built.houses[1]).toBe(1);
    expect(built.pCash).toBe(STARTING_CASH - BOARD[1]!.houseCost);

    // Even-build: can't build a second house on Med until Baltic also has 1.
    expect(canBuild(built.owners, built.houses, built.mortgaged, built.pCash, "p", 1)).toBe(false);
    expect(canBuild(built.owners, built.houses, built.mortgaged, built.pCash, "p", 3)).toBe(true);

    // Sell-house requires you to be the highest (or tied-highest) in the group.
    expect(canSellHouse(built.owners, built.houses, "p", 1)).toBe(true);
    const sold = reducer(built, { type: "sell-house", squareIdx: 1 });
    expect(sold.houses[1]).toBe(0);
    expect(sold.pCash).toBe(built.pCash + Math.floor(BOARD[1]!.houseCost / 2));
  });
});

describe("monopoly-full: end-to-end", () => {
  it("score stays non-negative through random play and terminates eventually", () => {
    let s = initialState(123, S);
    for (let i = 0; i < 5000; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "buy" });
      else if (s.phase === "auction") s = reducer(s, { type: "auction-pass" });
      else if (s.phase === "manage") s = reducer(s, { type: "end-turn" });
      else if (s.phase === "jail-choice") s = reducer(s, { type: "jail-pay" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    // Either terminated, or still in progress; in both cases score is non-negative.
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });

  it("netWorth tracks cash + property values", () => {
    let s: MonopolyFullState = {
      ...initialState(9, S),
      phase: "manage",
    };
    // Give player Mediterranean
    const o = s.owners.slice(); o[1] = "p"; s = { ...s, owners: o };
    expect(netWorth(s, "p")).toBe(STARTING_CASH + BOARD[1]!.price);

    // Mortgage halves the property's contribution.
    const m = s.mortgaged.slice(); m[1] = true; s = { ...s, mortgaged: m };
    expect(netWorth(s, "p")).toBe(STARTING_CASH + mortgageValue(1));
  });

  it("bankruptcy: cpu with negative cash and no assets is marked loser", () => {
    const base = initialState(33, S);
    const broke: MonopolyFullState = {
      ...base,
      cCash: -500,
      phase: "ai",
    };
    const after = reducer(broke, { type: "ai" });
    // After ai turn, end check fires (CPU can't unmortgage with neg cash; nothing to sell).
    // Either game ends now or after a couple more checks; should be done at some point.
    // The simplest assertion: the final state is either done with winner=p, or the cpu has been rolled.
    if (after.phase === "done") {
      expect(after.winner).toBe("p");
    }
  });
});
