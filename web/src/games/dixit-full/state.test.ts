import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  DECK,
  cpuChooseStory,
  cpuVote,
  cpuSubmitCard,
  type DixitFullState,
  type DixitFullSettings,
} from "./state.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const SETTINGS: DixitFullSettings = { _dummy: false };

function freshHumanStorytellerState(seed = 42): DixitFullState {
  return initialState(seed, SETTINGS);
}

describe("initialState", () => {
  it("is deterministic for the same seed", () => {
    const a = initialState(1234, SETTINGS);
    const b = initialState(1234, SETTINGS);
    expect(a.players.map(p => p.hand)).toEqual(b.players.map(p => p.hand));
    expect(a.storyteller).toBe(b.storyteller);
    expect(a.drawPile).toEqual(b.drawPile);
  });

  it("differs for different seeds", () => {
    const a = initialState(1, SETTINGS);
    const b = initialState(2, SETTINGS);
    // Hands very likely differ.
    expect(a.players[0]!.hand).not.toEqual(b.players[0]!.hand);
  });

  it("deals 4 players, each with 6 unique cards from the 84-card deck", () => {
    const s = initialState(7, SETTINGS);
    expect(s.players).toHaveLength(4);
    const allDrawn = new Set<number>();
    for (const p of s.players) {
      expect(p.hand).toHaveLength(6);
      for (const c of p.hand) {
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(DECK.length);
        expect(allDrawn.has(c)).toBe(false);
        allDrawn.add(c);
      }
    }
    // Total drawn = 24 unique, leaving 60 in pile.
    expect(allDrawn.size).toBe(24);
    expect(s.drawPile).toHaveLength(DECK.length - 24);
    // No overlap with hand cards.
    for (const c of s.drawPile) expect(allDrawn.has(c)).toBe(false);
  });

  it("starts with human as storyteller in story-pick phase", () => {
    const s = freshHumanStorytellerState();
    expect(s.phase).toBe("story-pick");
    expect(s.storyteller).toBe(0);
  });

  it("isTerminal is null on a fresh state", () => {
    expect(isTerminal(freshHumanStorytellerState())).toBeNull();
  });
});

describe("reducer — illegal actions return same reference", () => {
  it("submitStory without picking a card is a no-op", () => {
    const s = freshHumanStorytellerState();
    const s2 = reducer(s, { type: "submitStory" });
    expect(s2).toBe(s);
  });

  it("pickStoryCard with a non-hand card is a no-op", () => {
    const s = freshHumanStorytellerState();
    // Find a card NOT in human's hand.
    const notInHand = DECK.find(c => !s.players[0]!.hand.includes(c.id))!;
    const s2 = reducer(s, { type: "pickStoryCard", cardId: notInHand.id });
    expect(s2).toBe(s);
  });

  it("submitCard while in story-pick is a no-op", () => {
    const s = freshHumanStorytellerState();
    const s2 = reducer(s, { type: "submitCard", cardId: s.players[0]!.hand[0]! });
    expect(s2).toBe(s);
  });
});

describe("reducer — happy path single round (human is storyteller)", () => {
  it("typing a clue updates clueDraft", () => {
    const s = freshHumanStorytellerState();
    const s2 = reducer(s, { type: "typeClue", text: "  The dream  " });
    expect(s2.clueDraft).toBe("  The dream  ");
  });

  it("pickStoryCard sets pendingStoryCard", () => {
    const s = freshHumanStorytellerState();
    const c = s.players[0]!.hand[0]!;
    const s2 = reducer(s, { type: "pickStoryCard", cardId: c });
    expect(s2.pendingStoryCard).toBe(c);
  });

  it("submitStory (human teller) auto-resolves through to reveal", () => {
    let s = freshHumanStorytellerState(99);
    const c = s.players[0]!.hand[0]!;
    s = reducer(s, { type: "typeClue", text: "wonderful thing" });
    s = reducer(s, { type: "pickStoryCard", cardId: c });
    s = reducer(s, { type: "submitStory" });
    // Human is storyteller; CPUs both submit AND vote, so we land in reveal.
    expect(s.phase).toBe("reveal");
    // 1 story + 3 CPU submissions.
    expect(s.submissions).toHaveLength(4);
    expect(s.submissions.some(x => x.card === c)).toBe(true);
    // Tally has at least one line.
    expect(s.lastTally.length).toBeGreaterThan(0);
  });

  it("nextRound after reveal advances the round and rotates the storyteller", () => {
    let s = freshHumanStorytellerState(8);
    const c = s.players[0]!.hand[0]!;
    s = reducer(s, { type: "typeClue", text: "small mystery" });
    s = reducer(s, { type: "pickStoryCard", cardId: c });
    s = reducer(s, { type: "submitStory" });
    expect(s.phase).toBe("reveal");
    s = reducer(s, { type: "nextRound" });
    // Next storyteller is CPU (id 1) → auto resolves to 'submit' phase
    // (human must now submit a card matching the CPU clue).
    expect(s.round).toBe(2);
    expect(s.storyteller).toBe(1);
    expect(s.phase).toBe("submit");
    // CPU clue should be populated.
    expect(s.clue.length).toBeGreaterThan(0);
    // The CPU storyteller plus the two other CPU non-storytellers have all
    // submitted = 3 cards on the table. Human still needs to submit.
    expect(s.submissions).toHaveLength(3);
  });
});

describe("CPU helpers are deterministic for fixed rng", () => {
  it("cpuChooseStory picks a stable card+clue", () => {
    const hand = [1, 2, 3, 4, 5, 6];
    const a = cpuChooseStory(hand, mulberry32(1));
    const b = cpuChooseStory(hand, mulberry32(1));
    expect(a).toEqual(b);
    expect(hand).toContain(a.cardId);
    expect(typeof a.clue).toBe("string");
    expect(a.clue.length).toBeGreaterThan(0);
  });

  it("cpuSubmitCard returns a card from the hand", () => {
    const hand = [10, 20, 30, 40, 50, 60];
    const pick = cpuSubmitCard(hand, "a tower made of cake", mulberry32(5));
    expect(hand).toContain(pick);
  });

  it("cpuVote never votes for own card", () => {
    const subs = [
      { by: 0, card: 1, votes: [] },
      { by: 1, card: 2, votes: [] },
      { by: 2, card: 3, votes: [] },
      { by: 3, card: 4, votes: [] },
    ];
    const pick = cpuVote(1, "sweet dream", 1, subs, mulberry32(3));
    expect(pick).not.toBe(2);
  });
});

describe("Human-storyteller round resolves when human is not voting", () => {
  it("After submitStory with human as storyteller, full submissions list is 4 and game state remains valid", () => {
    let s = freshHumanStorytellerState(11);
    const c = s.players[0]!.hand[2]!;
    s = reducer(s, { type: "typeClue", text: "almost a scream" });
    s = reducer(s, { type: "pickStoryCard", cardId: c });
    s = reducer(s, { type: "submitStory" });
    // 1 story + 3 CPU subs.
    expect(s.submissions.length).toBe(4);
    // The story card is one of them.
    expect(s.submissions.some(x => x.card === c)).toBe(true);
  });
});

describe("Game can be forced to a terminal state via score injection", () => {
  it("isTerminal returns score when phase=done and human is the winner", () => {
    const s: DixitFullState = {
      ...freshHumanStorytellerState(),
      phase: "done",
      players: [
        { ...freshHumanStorytellerState().players[0]!, score: 30 },
        { ...freshHumanStorytellerState().players[1]!, score: 20 },
        { ...freshHumanStorytellerState().players[2]!, score: 18 },
        { ...freshHumanStorytellerState().players[3]!, score: 15 },
      ],
    };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(30);
  });

  it("isTerminal returns score=0 when human loses", () => {
    const fresh = freshHumanStorytellerState();
    const s: DixitFullState = {
      ...fresh,
      phase: "done",
      players: [
        { ...fresh.players[0]!, score: 22 },
        { ...fresh.players[1]!, score: 30 },
        { ...fresh.players[2]!, score: 18 },
        { ...fresh.players[3]!, score: 15 },
      ],
    };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(0);
  });
});
