// Shared blackjack engine. Cards are 0..51 ints. (rank = c%13, suit = floor(c/13))
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SUIT_GLYPH = ["♠", "♥", "♦", "♣"];
const RANK_LABEL = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export function bjCardName(c: number): string {
  return RANK_LABEL[c % 13]! + SUIT_GLYPH[Math.floor(c / 13)]!;
}
export function bjIsRed(c: number): boolean {
  const s = Math.floor(c / 13);
  return s === 1 || s === 2;
}
export function bjRank(c: number): number {
  return c % 13; // 0=A, 10=J,11=Q,12=K
}
export function bjValue(c: number): number {
  const r = c % 13;
  if (r === 0) return 11;
  if (r >= 10) return 10;
  return r + 1;
}
export function bjTotal(cards: readonly number[]): number {
  let total = 0; let aces = 0;
  for (const c of cards) {
    total += bjValue(c);
    if (c % 13 === 0) aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
export function bjIsSoft(cards: readonly number[]): boolean {
  let total = 0; let aces = 0;
  for (const c of cards) {
    total += bjValue(c);
    if (c % 13 === 0) aces++;
  }
  let softAces = aces;
  while (total > 21 && softAces > 0) { total -= 10; softAces--; }
  return softAces > 0 && total <= 21;
}
export function drawCard(rng: () => number, used: Set<number>, decks = 1): number {
  // Multi-deck reuse: cards are still 0..51 but we cycle.
  while (true) {
    const c = Math.floor(rng() * 52);
    if (decks > 1) return c; // simple multi-deck: never block
    if (!used.has(c)) { used.add(c); return c; }
  }
}
export function dealerHits(cards: readonly number[], hitSoft17 = true): boolean {
  const t = bjTotal(cards);
  if (t < 17) return true;
  if (t === 17 && hitSoft17 && bjIsSoft(cards)) return true;
  return false;
}
export function dealerPlay(initial: readonly number[], rng: () => number, used: Set<number>, hitSoft17 = true, decks = 1): number[] {
  const d = [...initial];
  while (dealerHits(d, hitSoft17)) {
    d.push(drawCard(rng, used, decks));
  }
  return d;
}

// Common BJ result calc. opts = { bjPays: 1.5, surrenderPays: 0.5 }
export interface BjResult { pts: number; result: string; }
export function settleHand(player: readonly number[], dealer: readonly number[], opts: { bjPays?: number; surrendered?: boolean } = {}): BjResult {
  const yt = bjTotal(player);
  const dt = bjTotal(dealer);
  if (opts.surrendered) return { pts: 5, result: `Surrendered (loses half)` };
  if (yt > 21) return { pts: 0, result: `Bust (${yt})` };
  const playerBJ = yt === 21 && player.length === 2;
  const dealerBJ = dt === 21 && dealer.length === 2;
  if (playerBJ && !dealerBJ) {
    const pay = opts.bjPays ?? 1.5;
    return { pts: Math.round(10 + 10 * pay), result: `Blackjack! (pays ${pay}:1)` };
  }
  if (dealerBJ && !playerBJ) return { pts: 0, result: `Dealer Blackjack` };
  if (playerBJ && dealerBJ) return { pts: 10, result: `Push (both BJ)` };
  if (dt > 21) return { pts: 20, result: `Dealer busts (${dt})` };
  if (yt > dt) return { pts: 20, result: `Win ${yt} vs ${dt}` };
  if (yt === dt) return { pts: 10, result: `Push (${yt})` };
  return { pts: 0, result: `Lose ${yt} vs ${dt}` };
}

// Convenience
export function makeRng(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng, nextSeed };
}
