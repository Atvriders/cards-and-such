import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  cardById,
  playerScore,
  HAND_SIZE,
  type DominionFullSettings,
  type DominionFullState,
} from "./state.js";

const S: DominionFullSettings = { cpuCount: 1 };
const S2: DominionFullSettings = { cpuCount: 2 };

describe("DominionFull state", () => {
  it("initialState is deterministic for the same seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("initialState has 2 players in 1-cpu mode and 3 in 2-cpu mode", () => {
    expect(initialState(1, S).players.length).toBe(2);
    expect(initialState(1, S2).players.length).toBe(3);
  });

  it("starting deck totals 10 cards (7 copper + 3 estate)", () => {
    const s = initialState(7, S);
    for (const p of s.players) {
      const all = [...p.deck, ...p.discard, ...p.hand, ...p.played];
      expect(all.length).toBe(10);
      const coppers = all.filter(id => id === "copper").length;
      const estates = all.filter(id => id === "estate").length;
      expect(coppers).toBe(7);
      expect(estates).toBe(3);
      expect(p.hand.length).toBe(HAND_SIZE);
    }
  });

  it("isTerminal is null on a fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("first player starts with 1 action and 1 buy", () => {
    const s = initialState(1, S);
    expect(s.current).toBe(0);
    expect(s.phase).toBe("action");
    expect(s.players[0]!.actions).toBe(1);
    expect(s.players[0]!.buys).toBe(1);
  });

  it("playAllTreasures converts hand treasures into coin and moves to buy phase", () => {
    const s = initialState(3, S);
    const before = s.players[0]!.hand.filter(id => cardById(id).kind === "treasure")
      .reduce((a, id) => a + cardById(id).coin, 0);
    const s2 = reducer(s, { type: "playAllTreasures" });
    expect(s2.phase).toBe("buy");
    expect(s2.players[0]!.coin).toBe(before);
  });

  it("buy deducts coin, decrements supply, adds card to discard", () => {
    let s = initialState(3, S);
    s = reducer(s, { type: "playAllTreasures" });
    const coin = s.players[0]!.coin;
    if (coin >= 2) {
      const supplyBefore = s.supply.estate!;
      const s2 = reducer(s, { type: "buy", cardId: "estate" });
      expect(s2.players[0]!.coin).toBe(coin - 2);
      expect(s2.supply.estate).toBe(supplyBefore - 1);
      expect(s2.players[0]!.discard).toContain("estate");
    }
  });

  it("illegal buy returns same state reference when coin is too low", () => {
    const s = initialState(1, S);
    const after = reducer(s, { type: "buy", cardId: "province" });
    // we're still in action phase (no treasures played), buy should be a no-op
    expect(after).toBe(s);
  });

  it("illegal action play returns same state reference when player has no actions", () => {
    let s = initialState(1, S);
    s = { ...s, players: [{ ...s.players[0]!, actions: 0 }, ...s.players.slice(1)] };
    const after = reducer(s, { type: "playAction", cardId: "village" });
    expect(after).toBe(s);
  });

  it("endBuyPhase advances to next player and resets phase to action", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "playAllTreasures" });
    s = reducer(s, { type: "endBuyPhase" });
    expect(s.phase).toBe("action");
    expect(s.current).toBe(1);
    expect(s.players[1]!.actions).toBe(1);
    expect(s.players[1]!.buys).toBe(1);
    // cleaned-up player has hand of 5
    expect(s.players[0]!.hand.length).toBe(HAND_SIZE);
  });

  it("game ends when province pile reaches 0", () => {
    let s = initialState(1, S);
    // Force-empty the province pile, then end the current turn
    s = { ...s, supply: { ...s.supply, province: 0 } };
    s = reducer(s, { type: "playAllTreasures" });
    s = reducer(s, { type: "endBuyPhase" });
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
  });

  it("game ends when 3 supply piles are empty", () => {
    let s = initialState(1, S);
    s = { ...s, supply: { ...s.supply, estate: 0, duchy: 0, curse: 0 } };
    s = reducer(s, { type: "playAllTreasures" });
    s = reducer(s, { type: "endBuyPhase" });
    expect(s.phase).toBe("done");
  });

  it("CPU step plays out a full turn without throwing", () => {
    let s = initialState(1, S);
    // Advance to CPU's turn
    s = reducer(s, { type: "playAllTreasures" });
    s = reducer(s, { type: "endBuyPhase" });
    expect(s.current).toBe(1);
    expect(s.players[1]!.isCpu).toBe(true);

    // Drive the CPU until phase changes back to action (next player) or game ends.
    let safety = 50;
    while (safety-- > 0 && s.phase !== "done" && s.current === 1) {
      const next = reducer(s, { type: "cpuStep" });
      if (next === s) break;
      s = next;
    }
    // Expect to have returned to the human player OR the game has ended
    expect(s.current === 0 || s.phase === "done").toBe(true);
  });

  it("full playthrough terminates and produces a non-negative score", () => {
    let s = initialState(99, S);
    let safety = 2000;
    while (s.phase !== "done" && safety-- > 0) {
      const current = s.players[s.current]!;
      if (current.isCpu) {
        const next = reducer(s, { type: "cpuStep" });
        if (next === s) break;
        s = next;
        continue;
      }
      // Human player: cheap auto-play (mirror Big Money)
      if (s.workshopPending) {
        s = reducer(s, { type: "workshopSkip" });
        continue;
      }
      if (s.phase === "action") {
        s = reducer(s, { type: "endActionPhase" });
        continue;
      }
      if (s.phase === "buy") {
        const player = s.players[s.current]!;
        if (player.hand.some(id => ["copper", "silver", "gold"].includes(id))) {
          s = reducer(s, { type: "playAllTreasures" });
          continue;
        }
        const coin = player.coin;
        if (coin >= 8 && (s.supply.province ?? 0) > 0) {
          s = reducer(s, { type: "buy", cardId: "province" });
        } else if (coin >= 6 && (s.supply.gold ?? 0) > 0) {
          s = reducer(s, { type: "buy", cardId: "gold" });
        } else if (coin >= 3 && (s.supply.silver ?? 0) > 0) {
          s = reducer(s, { type: "buy", cardId: "silver" });
        }
        s = reducer(s, { type: "endBuyPhase" });
      }
    }
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
  });

  it("playerScore counts victory and curse cards across the entire deck", () => {
    const s = initialState(1, S);
    const p = {
      ...s.players[0]!,
      deck: ["estate", "duchy"],
      discard: ["province"],
      hand: ["curse"],
      played: ["estate"],
    };
    expect(playerScore(p)).toBe(1 + 3 + 6 - 1 + 1);
  });

  it("done state does not advance the reducer further", () => {
    let s = initialState(1, S);
    s = { ...s, phase: "done" as const } as DominionFullState;
    const after = reducer(s, { type: "playAllTreasures" });
    expect(after).toBe(s);
  });
});
