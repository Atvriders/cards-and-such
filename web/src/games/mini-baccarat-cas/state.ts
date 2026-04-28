import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface MiniBaccaratCasSettings { dummy: boolean; }
export interface MiniBaccaratCasState { rngSeed: number; round: number; bet: "player" | "banker" | "tie" | null; player: number[]; banker: number[]; phase: "bet" | "scored" | "done"; score: number; pts: number; result: string; }
export type MiniBaccaratCasAction = { type: "bet"; side: "player" | "banker" | "tie" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function bacValue(c: number): number { const r = c % 13; if (r === 0) return 1; if (r >= 9) return 0; return r + 1; }
function bacTotal(cards: number[]): number { let t = 0; for (const c of cards) t += bacValue(c); return t % 10; }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}

export function initialState(seed: number, _s: MiniBaccaratCasSettings): MiniBaccaratCasState {
  return { rngSeed: seed, round: 1, bet: null, player: [], banker: [], phase: "bet", score: 0, pts: 0, result: "" };
}
export function reducer(state: MiniBaccaratCasState, action: MiniBaccaratCasAction): MiniBaccaratCasState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "bet") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const player = [drawCard(rng, used), drawCard(rng, used)];
    const banker = [drawCard(rng, used), drawCard(rng, used)];
    const pTot = bacTotal(player); const bTot = bacTotal(banker);
    // Simple draw rules
    if (pTot < 8 && bTot < 8) {
      if (pTot <= 5) player.push(drawCard(rng, used));
      if (bTot <= 5) banker.push(drawCard(rng, used));
    }
    const fp = bacTotal(player); const fb = bacTotal(banker);
    let outcome: "player" | "banker" | "tie";
    if (fp > fb) outcome = "player"; else if (fb > fp) outcome = "banker"; else outcome = "tie";
    let pts = 0; let result = `Player ${fp} vs Banker ${fb} — ${outcome}`;
    if (action.side === outcome) {
      if (outcome === "tie") pts = 40;
      else if (outcome === "banker") pts = 11;
      else pts = 12;
    }
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, bet: action.side, player, banker, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, bet: null, player: [], banker: [], pts: 0, result: "", phase: "bet" };
  }
  return state;
}
export function isTerminal(state: MiniBaccaratCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
