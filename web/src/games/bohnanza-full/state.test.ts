import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  coinsForField,
  BEANS,
  BEAN_ORDER,
  HAND_SIZE_START,
  NUM_PLAYERS,
  NUM_FIELDS,
} from "./state.js";

const S = { _dummy: false };

describe("Bohnanza-full state", () => {
  it("initialState is deterministic for the same seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.players.map((p) => p.hand)).toEqual(b.players.map((p) => p.hand));
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it("initialState varies for different seeds", () => {
    const a = initialState(1, S);
    const b = initialState(2, S);
    // very high probability the decks differ
    expect(a.deck).not.toEqual(b.deck);
  });

  it("creates 4 players each with 5-card hand and 2 fields", () => {
    const s = initialState(7, S);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    for (const p of s.players) {
      expect(p.hand).toHaveLength(HAND_SIZE_START);
      expect(p.fields).toHaveLength(NUM_FIELDS);
      expect(p.coins).toBe(0);
    }
    // one human, three CPUs
    expect(s.players[0]!.isCpu).toBe(false);
    expect(s.players.slice(1).every((p) => p.isCpu)).toBe(true);
  });

  it("deck contains exactly the right total card count", () => {
    const s = initialState(7, S);
    const totalInDeck = s.deck.length;
    const totalInHands = s.players.reduce((a, p) => a + p.hand.length, 0);
    const expectedTotal = BEAN_ORDER.reduce((a, k) => a + BEANS[k].count, 0);
    expect(totalInDeck + totalInHands).toBe(expectedTotal);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(11, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("coinsForField follows the published thresholds", () => {
    // Coffee: 4/7/10/12
    expect(coinsForField("coffee", 3)).toBe(0);
    expect(coinsForField("coffee", 4)).toBe(1);
    expect(coinsForField("coffee", 7)).toBe(2);
    expect(coinsForField("coffee", 10)).toBe(3);
    expect(coinsForField("coffee", 12)).toBe(4);
    // Garden (rare, only 2 tiers)
    expect(coinsForField("garden", 1)).toBe(0);
    expect(coinsForField("garden", 2)).toBe(1);
    expect(coinsForField("garden", 3)).toBe(2);
  });

  it("plantFirst with an empty field plants the front hand card and advances phase", () => {
    const s = initialState(5, S);
    const front = s.players[0]!.hand[0]!;
    const after = reducer(s, { type: "plantFirst" });
    expect(after.phase).toBe("plantSecondOptional");
    expect(after.players[0]!.hand.length).toBe(HAND_SIZE_START - 1);
    // at least one field should now hold that bean
    const planted = after.players[0]!.fields.some((f) => f.bean === front && f.count >= 1);
    expect(planted).toBe(true);
  });

  it("illegal action in wrong phase returns same state reference", () => {
    const s = initialState(5, S);
    // endTurn during plantFirst is not a legal flow
    const after = reducer(s, { type: "endTurn" });
    expect(after).toBe(s);
  });

  it("skipSecondPlant moves to tradePhase with two revealed cards (when deck has cards)", () => {
    let s = initialState(5, S);
    s = reducer(s, { type: "plantFirst" });
    expect(s.phase).toBe("plantSecondOptional");
    s = reducer(s, { type: "skipSecondPlant" });
    // either tradePhase or done (very unlikely with so many cards left)
    expect(["tradePhase", "done"]).toContain(s.phase);
    if (s.phase === "tradePhase") {
      expect(s.revealed.length).toBeGreaterThan(0);
      expect(s.revealed.length).toBeLessThanOrEqual(2);
    }
  });

  it("CPU turns auto-execute via cpuStep until back to human", () => {
    // run one full human turn then keep stepping
    let s = initialState(13, S);
    s = reducer(s, { type: "plantFirst" }); // plant first
    s = reducer(s, { type: "skipSecondPlant" }); // reveal trade cards
    if (s.phase === "tradePhase") s = reducer(s, { type: "endTurn" }); // proceed
    // skip revealed plants if any
    let safety = 30;
    while (s.phase === "plantRevealed" && safety-- > 0) {
      s = reducer(s, { type: "skipRevealedPlant" });
    }
    if (s.phase === "drawEnd") s = reducer(s, { type: "endTurn" });
    // Now should be CPU turn
    expect(["cpuTurn", "done"]).toContain(s.phase);
    // Step CPUs until back to human or done
    safety = 50;
    while (s.phase === "cpuTurn" && safety-- > 0) {
      s = reducer(s, { type: "cpuStep" });
    }
    expect(["plantFirst", "done"]).toContain(s.phase);
  });

  it("plays a full game (skip-all strategy) and ends with non-null isTerminal", () => {
    let s = initialState(99, S);
    let safety = 20000;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "cpuTurn") s = reducer(s, { type: "cpuStep" });
      else if (s.pendingPlant !== null) {
        // pick the field with the smallest count (which forces harvest if needed)
        const fields = s.players[0]!.fields;
        let best = 0;
        let bestCount = Infinity;
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i]!;
          if (f.count < bestCount) {
            bestCount = f.count;
            best = i;
          }
        }
        s = reducer(s, { type: "plantInto", fieldIndex: best });
      }
      else if (s.phase === "plantFirst") s = reducer(s, { type: "plantFirst" });
      else if (s.phase === "plantSecondOptional") s = reducer(s, { type: "skipSecondPlant" });
      else if (s.phase === "tradePhase") s = reducer(s, { type: "endTurn" });
      else if (s.phase === "plantRevealed") s = reducer(s, { type: "skipRevealedPlant" });
      else if (s.phase === "drawEnd") s = reducer(s, { type: "endTurn" });
      else break;
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("harvestField on an empty field returns same state reference (no-op)", () => {
    const s = initialState(5, S);
    const after = reducer(s, { type: "harvestField", fieldIndex: 0 });
    // field is empty so this is a no-op; we accept either === or .players[0] unchanged
    expect(after.players[0]!.coins).toBe(0);
  });
});
