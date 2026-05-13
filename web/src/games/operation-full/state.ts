import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Operation (Full Specialist) — the full Cavity-Sam round.
// 12 classic ailments. The "tweezer" UI requires the player to drag a
// cursor into a small tolerance zone within a time window without crossing
// the body-cavity edges. Doctor specialist cards drawn between extractions
// modify the next attempt (free bonus, double fee, steady hand, etc.).
// Score = sum of fees collected. Game ends when all 12 ailments are
// extracted OR after 3 buzzer failures.

export interface OperationFullSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Ailment {
  /** Stable id (kebab-case). */
  id: string;
  /** Display name. */
  name: string;
  /** Body part hint (label only). */
  bodyPart: string;
  /** Point reward when successfully extracted. */
  fee: number;
  /** Radius of the tolerance zone (smaller = harder), in surface-relative units 0..1. */
  toleranceRadius: number;
  /** Time limit in ms for the extraction attempt. */
  timeLimitMs: number;
  /** Position of the cavity centre on the body, surface-relative 0..1. */
  cx: number;
  cy: number;
  /** Half-extent of the body cavity (the play zone) in surface-relative units. */
  cavityW: number;
  cavityH: number;
}

/** The 12 classic Operation ailments. Fees roughly mirror the 1965 game's
 *  printed scores. */
export const ALL_AILMENTS: readonly Ailment[] = [
  { id: "adams-apple",      name: "Adam's Apple",            bodyPart: "throat",  fee: 100, toleranceRadius: 0.07, timeLimitMs: 4000, cx: 0.50, cy: 0.12, cavityW: 0.08, cavityH: 0.07 },
  { id: "bread-basket",     name: "Bread Basket",            bodyPart: "stomach", fee: 100, toleranceRadius: 0.07, timeLimitMs: 4000, cx: 0.50, cy: 0.46, cavityW: 0.09, cavityH: 0.08 },
  { id: "wish-bone",        name: "Wish Bone",               bodyPart: "chest",   fee: 300, toleranceRadius: 0.05, timeLimitMs: 4000, cx: 0.50, cy: 0.26, cavityW: 0.07, cavityH: 0.06 },
  { id: "funny-bone",       name: "Funny Bone",              bodyPart: "elbow",   fee: 100, toleranceRadius: 0.07, timeLimitMs: 4000, cx: 0.20, cy: 0.36, cavityW: 0.06, cavityH: 0.06 },
  { id: "butterflies",      name: "Butterflies in Stomach",  bodyPart: "stomach", fee: 150, toleranceRadius: 0.06, timeLimitMs: 4000, cx: 0.42, cy: 0.50, cavityW: 0.07, cavityH: 0.07 },
  { id: "charley-horse",    name: "Charley Horse",           bodyPart: "thigh",   fee: 200, toleranceRadius: 0.06, timeLimitMs: 4000, cx: 0.42, cy: 0.74, cavityW: 0.07, cavityH: 0.08 },
  { id: "wrenched-ankle",   name: "Wrenched Ankle",          bodyPart: "ankle",   fee: 150, toleranceRadius: 0.05, timeLimitMs: 3500, cx: 0.44, cy: 0.94, cavityW: 0.05, cavityH: 0.05 },
  { id: "spare-ribs",       name: "Spare Ribs",              bodyPart: "ribs",    fee: 150, toleranceRadius: 0.06, timeLimitMs: 4000, cx: 0.60, cy: 0.36, cavityW: 0.07, cavityH: 0.07 },
  { id: "broken-heart",     name: "Broken Heart",            bodyPart: "chest",   fee: 100, toleranceRadius: 0.06, timeLimitMs: 4000, cx: 0.42, cy: 0.32, cavityW: 0.07, cavityH: 0.07 },
  { id: "brain-freeze",     name: "Brain Freeze",            bodyPart: "head",    fee: 200, toleranceRadius: 0.05, timeLimitMs: 4000, cx: 0.50, cy: 0.06, cavityW: 0.06, cavityH: 0.05 },
  { id: "writers-cramp",    name: "Writer's Cramp",          bodyPart: "hand",    fee: 200, toleranceRadius: 0.05, timeLimitMs: 3500, cx: 0.14, cy: 0.50, cavityW: 0.05, cavityH: 0.05 },
  { id: "water-on-knee",    name: "Water on the Knee",       bodyPart: "knee",    fee: 150, toleranceRadius: 0.06, timeLimitMs: 4000, cx: 0.56, cy: 0.84, cavityW: 0.06, cavityH: 0.06 },
];

export const TOTAL_AILMENTS = 12;
export const MAX_BUZZERS = 3;

/** Specialist Doctor cards drawn between extractions. Modifies the NEXT attempt. */
export type DoctorEffect =
  | "free-bonus"   // +50 bonus regardless of outcome
  | "double-fee"   // success doubles the fee
  | "steady-hand"  // +50% tolerance radius (easier)
  | "rush-job"    // -1500ms time (harder, but +100 if you make it)
  | "no-buzzer"   // a buzz this turn doesn't add a failure
  | "second-opinion"; // a miss this turn doesn't lose the ailment

export interface DoctorCard {
  effect: DoctorEffect;
  name: string;
  description: string;
}

const DOCTOR_DECK: readonly DoctorCard[] = [
  { effect: "free-bonus",     name: "Generous Donor",   description: "+50 bonus regardless of outcome." },
  { effect: "double-fee",     name: "Insurance Bonus",  description: "Success doubles the fee." },
  { effect: "steady-hand",    name: "Steady Hand",      description: "Bigger tolerance zone this turn." },
  { effect: "rush-job",       name: "Rush Job",         description: "Less time, but +100 bonus if you succeed." },
  { effect: "no-buzzer",      name: "Malpractice Waiver", description: "A buzz this turn won't count as a failure." },
  { effect: "second-opinion", name: "Second Opinion",   description: "If you miss, the ailment stays in play." },
];

export type Phase =
  | "ready"      // waiting at the start of a turn, about to draw card / show ailment
  | "drawing"    // a doctor card was drawn and shown
  | "active"     // tweezer attempt in progress
  | "result"     // showing success / fail / buzz outcome between turns
  | "done";      // game over

export type Outcome = "success" | "miss" | "buzz";

export interface OperationFullState {
  settings: OperationFullSettings;
  /** Shuffled order of ailments to extract; we splice from this list. */
  remaining: readonly Ailment[];
  /** Index 0..11 — pull from `remaining[0]` for the current attempt. */
  current: Ailment | null;
  /** Doctor card buffed onto the next attempt, if any. Consumed on attempt. */
  activeDoctor: DoctorCard | null;
  /** Score (sum of fees, plus doctor bonuses). */
  score: number;
  /** Number of ailments successfully extracted. */
  extracted: number;
  /** Number of buzzer failures. */
  buzzers: number;
  /** Last outcome for the result screen. */
  lastOutcome: Outcome | null;
  /** Last fee awarded (after doctor card adjustments). */
  lastFee: number;
  /** Doctor-card RNG seed (advances as we draw). */
  rngSeed: number;
  phase: Phase;
  /** Difficulty multiplier on tolerance radius (>1 = easier). */
  difficultyMultiplier: number;
}

export type OperationFullAction =
  | { type: "draw" }
  | { type: "start" }
  | { type: "resolve"; outcome: Outcome }
  | { type: "next" };

function diffMult(d: string): number {
  if (d === "easy") return 1.4;
  if (d === "hard") return 0.7;
  return 1.0;
}

function shuffle<T>(arr: readonly T[], seed: number): { items: T[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { items: out, nextSeed };
}

export function initialState(seed: number, settings: OperationFullSettings): OperationFullState {
  const { items, nextSeed } = shuffle(ALL_AILMENTS, seed);
  return {
    settings,
    remaining: items,
    current: items[0] ?? null,
    activeDoctor: null,
    score: 0,
    extracted: 0,
    buzzers: 0,
    lastOutcome: null,
    lastFee: 0,
    rngSeed: nextSeed,
    phase: "ready",
    difficultyMultiplier: diffMult(settings.difficulty),
  };
}

/** Draw a doctor card from the deck deterministically using rngSeed. */
function drawDoctor(seed: number): { card: DoctorCard; nextSeed: number } {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * DOCTOR_DECK.length);
  const card = DOCTOR_DECK[idx]!;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { card, nextSeed };
}

/** Returns the effective ailment params, mutated by the active doctor card. */
export function effectiveParams(state: OperationFullState): { tolerance: number; timeLimitMs: number } | null {
  if (!state.current) return null;
  let tol = state.current.toleranceRadius * state.difficultyMultiplier;
  let tlm = state.current.timeLimitMs;
  const d = state.activeDoctor;
  if (d) {
    if (d.effect === "steady-hand") tol *= 1.5;
    if (d.effect === "rush-job") tlm -= 1500;
  }
  return { tolerance: tol, timeLimitMs: Math.max(800, tlm) };
}

export function reducer(state: OperationFullState, action: OperationFullAction): OperationFullState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "draw": {
      if (state.phase !== "ready") return state;
      // 50% chance per attempt to receive a doctor card. Deterministic by seed.
      const rng = mulberry32(state.rngSeed);
      const gets = rng() < 0.5;
      const after1 = Math.floor(rng() * 2 ** 31);
      if (!gets) {
        return { ...state, rngSeed: after1, phase: "active", activeDoctor: null };
      }
      const { card, nextSeed } = drawDoctor(after1);
      return { ...state, activeDoctor: card, rngSeed: nextSeed, phase: "drawing" };
    }

    case "start": {
      if (state.phase !== "drawing" && state.phase !== "ready") return state;
      if (!state.current) return state;
      return { ...state, phase: "active" };
    }

    case "resolve": {
      if (state.phase !== "active") return state;
      const cur = state.current;
      if (!cur) return state;
      const d = state.activeDoctor;
      let outcome = action.outcome;
      // Apply "no-buzzer" pre-check: a buzz becomes a miss instead.
      if (outcome === "buzz" && d?.effect === "no-buzzer") {
        outcome = "miss";
      }

      let fee = 0;
      let extracted = state.extracted;
      let buzzers = state.buzzers;
      let nextRemaining: readonly Ailment[] = state.remaining.slice(1);

      if (outcome === "success") {
        fee = cur.fee;
        if (d?.effect === "double-fee") fee *= 2;
        if (d?.effect === "rush-job") fee += 100;
        extracted += 1;
      } else if (outcome === "miss") {
        // Failed to reach zone in time. With "second-opinion" the ailment
        // stays in play (cycle it to the back of the queue).
        if (d?.effect === "second-opinion") {
          nextRemaining = [...state.remaining.slice(1), cur];
        }
      } else if (outcome === "buzz") {
        buzzers += 1;
        // Buzzer drops the ailment from the round (no second-opinion).
      }

      // Doctor's flat bonus is always applied if present.
      if (d?.effect === "free-bonus") fee += 50;

      const score = state.score + fee;
      const nextCurrent = nextRemaining[0] ?? null;
      const allDone = nextCurrent === null;
      const bustedOut = buzzers >= MAX_BUZZERS;
      const done = allDone || bustedOut;

      return {
        ...state,
        remaining: nextRemaining,
        current: nextCurrent,
        activeDoctor: null,
        score,
        extracted,
        buzzers,
        lastOutcome: outcome,
        lastFee: fee,
        phase: done ? "done" : "result",
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      return { ...state, phase: "ready", lastOutcome: null, lastFee: 0 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: OperationFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, state.score) };
}

export { DOCTOR_DECK };
