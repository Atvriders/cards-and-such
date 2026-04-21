import { describe, expect, it } from "vitest";
import { newDeck, shuffle, deal, cardId, isRed } from "./index.js";
import { rankHand } from "./ranking.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

describe("deck", () => {
  it("has 52 unique cards", () => {
    const d = newDeck();
    expect(d.length).toBe(52);
    expect(new Set(d.map((c) => cardId(c.suit, c.rank))).size).toBe(52);
  });

  it("shuffle is deterministic under seed", () => {
    const rngA = mulberry32(7);
    const rngB = mulberry32(7);
    const a = shuffle(newDeck(), rngA);
    const b = shuffle(newDeck(), rngB);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
  });

  it("deal splits the pile", () => {
    const deck = newDeck();
    const { drawn, remaining } = deal(deck, 5);
    expect(drawn.length).toBe(5);
    expect(remaining.length).toBe(47);
  });

  it("isRed classifies suits correctly", () => {
    expect(isRed("♥")).toBe(true);
    expect(isRed("♦")).toBe(true);
    expect(isRed("♠")).toBe(false);
    expect(isRed("♣")).toBe(false);
  });
});

describe("rankHand", () => {
  const card = (suit: "♠"|"♥"|"♦"|"♣", rank: number): { suit: "♠"|"♥"|"♦"|"♣"; rank: any; id: string } =>
    ({ suit, rank: rank as any, id: `${suit}${rank}` });

  it("detects straight flush", () => {
    const h = rankHand([card("♠",5),card("♠",4),card("♠",3),card("♠",2),card("♠",1)]);
    expect(h.class).toBe("straight-flush");
    expect(h.kickers[0]).toBe(5);
  });
  it("detects four of a kind", () => {
    const h = rankHand([card("♠",7),card("♥",7),card("♦",7),card("♣",7),card("♠",2)]);
    expect(h.class).toBe("four-of-a-kind");
  });
  it("detects full house", () => {
    const h = rankHand([card("♠",8),card("♥",8),card("♦",8),card("♣",3),card("♠",3)]);
    expect(h.class).toBe("full-house");
  });
  it("detects flush", () => {
    const h = rankHand([card("♥",2),card("♥",5),card("♥",7),card("♥",9),card("♥",12)]);
    expect(h.class).toBe("flush");
  });
  it("detects straight", () => {
    const h = rankHand([card("♠",10),card("♥",9),card("♦",8),card("♣",7),card("♠",6)]);
    expect(h.class).toBe("straight");
  });
  it("detects wheel straight (A-2-3-4-5)", () => {
    const h = rankHand([card("♠",1),card("♥",2),card("♦",3),card("♣",4),card("♠",5)]);
    expect(h.class).toBe("straight");
    expect(h.kickers[0]).toBe(5);
  });
  it("detects three of a kind", () => {
    const h = rankHand([card("♠",9),card("♥",9),card("♦",9),card("♣",2),card("♠",5)]);
    expect(h.class).toBe("three-of-a-kind");
  });
  it("detects two pair", () => {
    const h = rankHand([card("♠",10),card("♥",10),card("♦",4),card("♣",4),card("♠",2)]);
    expect(h.class).toBe("two-pair");
  });
  it("detects one pair", () => {
    const h = rankHand([card("♠",11),card("♥",11),card("♦",4),card("♣",6),card("♠",2)]);
    expect(h.class).toBe("one-pair");
  });
  it("detects high card", () => {
    const h = rankHand([card("♠",2),card("♥",5),card("♦",7),card("♣",10),card("♠",13)]);
    expect(h.class).toBe("high-card");
  });
});
