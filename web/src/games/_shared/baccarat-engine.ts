// Shared baccarat engine. Cards are 0..51, value = (rank+1) clipped: A=1, 2..9=face, 10/J/Q/K=0.
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export function bcValue(c: number): number {
  const r = c % 13;
  if (r === 0) return 1;        // Ace
  if (r >= 9) return 0;         // 10/J/Q/K
  return r + 1;
}
export function bcTotal(cards: readonly number[]): number {
  let t = 0;
  for (const c of cards) t += bcValue(c);
  return t % 10;
}

export function drawC(rng: () => number, used: Set<number>): number {
  while (true) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); return c; }
  }
}

/** Standard baccarat resolution returning final hands. */
export function resolveBaccarat(rng: () => number, used: Set<number>): { player: number[]; banker: number[]; pTotal: number; bTotal: number; outcome: "player" | "banker" | "tie" } {
  const player = [drawC(rng, used), drawC(rng, used)];
  const banker = [drawC(rng, used), drawC(rng, used)];
  let pT = bcTotal(player);
  let bT = bcTotal(banker);
  // Naturals
  if (pT >= 8 || bT >= 8) {
    return finalize(player, banker);
  }
  // Player draws if total 0-5
  let pThird: number | null = null;
  if (pT <= 5) {
    const c = drawC(rng, used);
    player.push(c);
    pThird = bcValue(c);
  }
  // Banker rules
  bT = bcTotal(banker);
  if (pThird === null) {
    if (bT <= 5) banker.push(drawC(rng, used));
  } else {
    if (bT <= 2) banker.push(drawC(rng, used));
    else if (bT === 3 && pThird !== 8) banker.push(drawC(rng, used));
    else if (bT === 4 && pThird >= 2 && pThird <= 7) banker.push(drawC(rng, used));
    else if (bT === 5 && pThird >= 4 && pThird <= 7) banker.push(drawC(rng, used));
    else if (bT === 6 && (pThird === 6 || pThird === 7)) banker.push(drawC(rng, used));
  }
  return finalize(player, banker);
}

function finalize(player: number[], banker: number[]): { player: number[]; banker: number[]; pTotal: number; bTotal: number; outcome: "player" | "banker" | "tie" } {
  const pTotal = bcTotal(player);
  const bTotal = bcTotal(banker);
  let outcome: "player" | "banker" | "tie" = "tie";
  if (pTotal > bTotal) outcome = "player";
  else if (bTotal > pTotal) outcome = "banker";
  return { player, banker, pTotal, bTotal, outcome };
}

export function makeRng(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng, nextSeed };
}
