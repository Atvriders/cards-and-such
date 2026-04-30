import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DieFace } from "../../engines/dice/index.js";

// Mini Cee-lo — best-of-N rounds vs CPU.
// Each round: each player rolls 3 dice. Standard Cee-lo precedence:
//  4-5-6: instant win (rank 5)
//  Triple X-X-X: rank 4, tiebreak by face
//  Pair + odd "point": rank 3, tiebreak by point
//  1-2-3: instant loss (rank 0)
//  No score (mixed singles): rank 1
// Winner of round +1 round; ties = re-roll same round.

export const TOTAL_ROUNDS = 5;     // best of 5
export const ROUND_TARGET = 3;     // first to 3 wins

export type CeeLoOutcome =
  | { kind: "win456" }
  | { kind: "loss123" }
  | { kind: "triple"; face: DieFace }
  | { kind: "point"; pair: DieFace; point: DieFace }
  | { kind: "noscore" };

export interface MiniCeeLoSettings { dummy: boolean; }

export interface MiniCeeLoState {
  rngSeed: number;
  round: number;
  playerWins: number;
  cpuWins: number;
  playerDice: [DieFace, DieFace, DieFace] | null;
  cpuDice: [DieFace, DieFace, DieFace] | null;
  playerOutcome: CeeLoOutcome | null;
  cpuOutcome: CeeLoOutcome | null;
  roundResult: "player" | "cpu" | "tie" | null;
  phase: "ready" | "rolled" | "done";
}

export type MiniCeeLoAction = { type: "roll" } | { type: "next" };

export function evaluateRoll(d: readonly [DieFace, DieFace, DieFace]): CeeLoOutcome {
  const sorted = [...d].sort((a, b) => a - b) as [DieFace, DieFace, DieFace];
  if (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) return { kind: "win456" };
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) return { kind: "loss123" };
  if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) return { kind: "triple", face: sorted[0] };
  if (sorted[0] === sorted[1]) return { kind: "point", pair: sorted[0], point: sorted[2] };
  if (sorted[1] === sorted[2]) return { kind: "point", pair: sorted[1], point: sorted[0] };
  return { kind: "noscore" };
}

export function rankOutcome(o: CeeLoOutcome): number {
  switch (o.kind) {
    case "win456": return 5_000;
    case "triple": return 4_000 + o.face;
    case "point":  return 3_000 + o.point;
    case "noscore": return 1_000;
    case "loss123": return 0;
  }
}

export function compareOutcomes(a: CeeLoOutcome, b: CeeLoOutcome): number {
  return rankOutcome(a) - rankOutcome(b);
}

export function describeOutcome(o: CeeLoOutcome): string {
  switch (o.kind) {
    case "win456": return "4-5-6 — auto-win!";
    case "loss123": return "1-2-3 — auto-loss";
    case "triple": return `Triple ${o.face}s`;
    case "point": return `Pair of ${o.pair}s, point ${o.point}`;
    case "noscore": return "No score";
  }
}

function rollThree(rng: () => number): [DieFace, DieFace, DieFace] {
  return [
    (1 + Math.floor(rng() * 6)) as DieFace,
    (1 + Math.floor(rng() * 6)) as DieFace,
    (1 + Math.floor(rng() * 6)) as DieFace,
  ];
}

export function initialState(seed: number, _s: MiniCeeLoSettings): MiniCeeLoState {
  return {
    rngSeed: seed,
    round: 1,
    playerWins: 0,
    cpuWins: 0,
    playerDice: null,
    cpuDice: null,
    playerOutcome: null,
    cpuOutcome: null,
    roundResult: null,
    phase: "ready",
  };
}

export function reducer(state: MiniCeeLoState, action: MiniCeeLoAction): MiniCeeLoState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const player = rollThree(rng);
    const cpu = rollThree(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const playerOutcome = evaluateRoll(player);
    const cpuOutcome = evaluateRoll(cpu);
    const cmp = compareOutcomes(playerOutcome, cpuOutcome);
    let roundResult: "player" | "cpu" | "tie";
    if (cmp > 0) roundResult = "player";
    else if (cmp < 0) roundResult = "cpu";
    else roundResult = "tie";

    let pWins = state.playerWins;
    let cWins = state.cpuWins;
    if (roundResult === "player") pWins++;
    else if (roundResult === "cpu") cWins++;

    const target = ROUND_TARGET;
    const seriesDone = pWins >= target || cWins >= target;
    const lastRound = state.round >= TOTAL_ROUNDS;
    const phase: "rolled" | "done" = (seriesDone || (lastRound && roundResult !== "tie")) ? "done" : "rolled";

    return {
      ...state,
      rngSeed: nextSeed,
      playerDice: player,
      cpuDice: cpu,
      playerOutcome,
      cpuOutcome,
      roundResult,
      playerWins: pWins,
      cpuWins: cWins,
      phase,
    };
  }

  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    // If tie, re-roll same round; else advance round
    const isTie = state.roundResult === "tie";
    return {
      ...state,
      round: isTie ? state.round : state.round + 1,
      playerDice: null,
      cpuDice: null,
      playerOutcome: null,
      cpuOutcome: null,
      roundResult: null,
      phase: "ready",
    };
  }

  return state;
}

export function isTerminal(state: MiniCeeLoState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: player rounds * 100 - cpu rounds * 50, plus 1000 if won the series
  const wonSeries = state.playerWins > state.cpuWins;
  const base = state.playerWins * 100 - state.cpuWins * 50;
  return { score: base + (wonSeries ? 1000 : 0) };
}
