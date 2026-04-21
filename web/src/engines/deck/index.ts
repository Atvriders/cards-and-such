export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // 1=Ace, 11=J, 12=Q, 13=K
export interface Card { suit: Suit; rank: Rank; id: string }

export const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function cardId(suit: Suit, rank: Rank): string {
  return `${suit}${rank}`;
}

export function newDeck(copies = 1): Card[] {
  const cards: Card[] = [];
  for (let c = 0; c < copies; c++) {
    for (const s of SUITS) for (const r of RANKS) {
      cards.push({ suit: s, rank: r, id: `${c}-${cardId(s, r)}` });
    }
  }
  return cards;
}

export function shuffle<T>(cards: readonly T[], rng: () => number): T[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

export function deal<T>(pile: T[], n: number): { drawn: T[]; remaining: T[] } {
  const drawn = pile.slice(0, n);
  const remaining = pile.slice(n);
  return { drawn, remaining };
}

export function isRed(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

export function rankLabel(rank: Rank): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}
