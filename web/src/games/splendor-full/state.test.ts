import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  COLORS,
  TIER_FACEUP,
  TIER_COUNT,
  TIER_SIZES,
  PLAYER_COUNT,
  TOKEN_SUPPLY_PER_COLOR,
  GOLD_SUPPLY,
  NOBLES_IN_PLAY,
  WIN_PRESTIGE,
  totalTokens,
  permanentGems,
  affordCost,
} from "./state.js";
import type { Action, SplendorFullState } from "./state.js";

const S = { _dummy: false };

function freshState(seed = 42): SplendorFullState {
  return initialState(seed, S);
}

describe("Splendor Full — initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("seats 4 players (you + 3 CPUs)", () => {
    const s = freshState();
    expect(s.players.length).toBe(PLAYER_COUNT);
    expect(s.players[0]!.isCPU).toBe(false);
    for (let i = 1; i < PLAYER_COUNT; i++) {
      expect(s.players[i]!.isCPU).toBe(true);
    }
  });

  it("deals 4 face-up cards per tier from 3 tiers", () => {
    const s = freshState();
    expect(s.rows.length).toBe(TIER_COUNT);
    for (let t = 0; t < TIER_COUNT; t++) {
      expect(s.rows[t]!.length).toBe(TIER_FACEUP);
      // Remaining deck = full size minus the 4 face-up
      expect(s.decks[t]!.length).toBe(TIER_SIZES[t]! - TIER_FACEUP);
    }
  });

  it("deals exactly 3 nobles", () => {
    const s = freshState();
    expect(s.nobles.length).toBe(NOBLES_IN_PLAY);
  });

  it("bank has correct token counts", () => {
    const s = freshState();
    for (const c of COLORS) expect(s.bank[c]).toBe(TOKEN_SUPPLY_PER_COLOR);
    expect(s.bank.gold).toBe(GOLD_SUPPLY);
  });

  it("isTerminal is null at start", () => {
    const s = freshState();
    expect(isTerminal(s)).toBeNull();
  });
});

describe("Splendor Full — reducer basic actions", () => {
  it("take3 with 3 distinct colors decrements bank and increments player", () => {
    const s0 = freshState();
    const colors = COLORS.slice(0, 3);
    const s = reducer(s0, { type: "take3", colors } as Action);
    expect(s).not.toBe(s0);
    for (const c of colors) {
      expect(s.bank[c]).toBe(TOKEN_SUPPLY_PER_COLOR - 1);
      expect(s.players[0]!.tokens[c]).toBe(1);
    }
    // Turn advanced to seat 1
    expect(s.current).toBe(1);
  });

  it("take2 of one color when ≥4 in bank", () => {
    const s0 = freshState();
    const s = reducer(s0, { type: "take2", color: "ruby" } as Action);
    expect(s.bank.ruby).toBe(TOKEN_SUPPLY_PER_COLOR - 2);
    expect(s.players[0]!.tokens.ruby).toBe(2);
    expect(s.current).toBe(1);
  });

  it("ignores invalid take2 (bank < 4)", () => {
    const s0 = freshState();
    // Empty the ruby bank down below 4
    s0.bank.ruby = 3;
    const s = reducer(s0, { type: "take2", color: "ruby" } as Action);
    expect(s).toBe(s0);
  });

  it("reserve face-up card adds to reserved and grants 1 gold", () => {
    const s0 = freshState();
    const s = reducer(s0, { type: "reserve", tier: 0, slot: 0 } as Action);
    expect(s.players[0]!.reserved.length).toBe(1);
    expect(s.players[0]!.tokens.gold).toBe(1);
    expect(s.bank.gold).toBe(GOLD_SUPPLY - 1);
    // Card was refilled or set to null
    expect(s.rows[0]!.length).toBe(TIER_FACEUP);
  });

  it("ignores invalid actions during a CPU turn", () => {
    const s0 = freshState();
    // Take a token to advance to CPU seat 1
    const s1 = reducer(s0, { type: "take3", colors: ["ruby"] } as Action);
    expect(s1.players[s1.current]!.isCPU).toBe(true);
    // Human-side action attempted while CPU has the turn returns same state
    const s2 = reducer(s1, { type: "take3", colors: ["ruby"] } as Action);
    expect(s2).toBe(s1);
  });

  it("cpuStep advances CPU turn", () => {
    let s = freshState();
    // Cycle past human and one CPU
    s = reducer(s, { type: "take3", colors: ["ruby"] } as Action);
    expect(s.players[s.current]!.isCPU).toBe(true);
    const before = s.current;
    s = reducer(s, { type: "cpuStep" } as Action);
    // The CPU should have made a move and advanced to the next seat
    expect(s.current).not.toBe(before);
  });
});

describe("Splendor Full — economics", () => {
  it("affordCost: free card (no cost) costs nothing", () => {
    const s = freshState();
    const p = s.players[0]!;
    // Synthesize a free card on a low tier
    const card = { id: -1, tier: 0 as const, color: "ruby" as const, prestige: 0,
                   cost: { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 } };
    expect(affordCost(p, card)).toBe(0);
  });

  it("affordCost: returns -1 when not enough tokens or gold", () => {
    const s = freshState();
    const p = s.players[0]!;
    const card = { id: -2, tier: 2 as const, color: "ruby" as const, prestige: 5,
                   cost: { emerald: 4, sapphire: 4, ruby: 0, diamond: 0, onyx: 0 } };
    expect(affordCost(p, card)).toBe(-1);
  });

  it("permanentGems counts purchased card colors", () => {
    const s = freshState();
    const p = s.players[0]!;
    p.bought.push({ id: -1, tier: 0, color: "ruby", prestige: 0,
                    cost: { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 } });
    p.bought.push({ id: -2, tier: 0, color: "ruby", prestige: 0,
                    cost: { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 } });
    const perm = permanentGems(p);
    expect(perm.ruby).toBe(2);
    expect(perm.emerald).toBe(0);
  });
});

describe("Splendor Full — game progression", () => {
  it("a play-through with CPU steps eventually terminates", () => {
    let s = freshState(123);
    const MAX_STEPS = 4000;
    let steps = 0;
    while (s.phase !== "done" && steps < MAX_STEPS) {
      if (s.players[s.current]!.isCPU) {
        s = reducer(s, { type: "cpuStep" } as Action);
      } else {
        // Human strategy: try to buy the cheapest affordable card; else take3 distinct
        let acted = false;
        for (let t = 0 as 0 | 1 | 2; t < 3; t = (t + 1) as 0 | 1 | 2) {
          for (let slot = 0; slot < TIER_FACEUP; slot++) {
            const c = s.rows[t]![slot];
            if (c && affordCost(s.players[0]!, c) >= 0) {
              s = reducer(s, { type: "buyFaceup", tier: t, slot } as Action);
              acted = true;
              break;
            }
          }
          if (acted) break;
        }
        if (!acted) {
          const pickColors = COLORS.filter((c) => s.bank[c] > 0).slice(0, 3);
          if (pickColors.length > 0) {
            s = reducer(s, { type: "take3", colors: pickColors } as Action);
          } else {
            // Bank empty for all colors: try reserve top of T1
            s = reducer(s, { type: "reserveTop", tier: 0 } as Action);
          }
        }
      }
      steps++;
    }
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    if (term) expect(term.score).toBeGreaterThanOrEqual(0);
    // Some player should have reached >= WIN_PRESTIGE
    const max = Math.max(...s.players.map((p) => p.prestige));
    expect(max).toBeGreaterThanOrEqual(WIN_PRESTIGE);
  });

  it("token hand limit is auto-enforced", () => {
    let s = freshState(99);
    // 1 human turn: take 3
    s = reducer(s, { type: "take3", colors: ["ruby", "emerald", "sapphire"] } as Action);
    // After all turns, your tokens ≤ 10
    expect(totalTokens(s.players[0]!.tokens)).toBeLessThanOrEqual(10);
  });
});
