import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  scoreNOfAKind,
  scoreFullHouse,
  scoreSmallStraight,
  scoreLargeStraight,
  scoreYahtzee,
  scoreChance,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Category =
  | "aces" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "threeOfAKind" | "fourOfAKind" | "fullHouse"
  | "smallStraight" | "largeStraight" | "yahtzee" | "chance";

export const ALL_CATEGORIES: Category[] = [
  "aces", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];

export const UPPER_CATEGORIES: Category[] = [
  "aces", "twos", "threes", "fours", "fives", "sixes",
];

export const LOWER_CATEGORIES: Category[] = [
  "threeOfAKind", "fourOfAKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  aces: "Aces (1s)",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  threeOfAKind: "3 of a Kind",
  fourOfAKind: "4 of a Kind",
  fullHouse: "Full House (25)",
  smallStraight: "Sm. Straight (30)",
  largeStraight: "Lg. Straight (40)",
  yahtzee: "YAHTZEE (50)",
  chance: "Chance",
};

const CATEGORY_TO_FACE: Partial<Record<Category, DieFace>> = {
  aces: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6,
};

export interface YahtzeeFullMatchSettings {
  _dummy: boolean;
}

export type Phase = "rolling" | "scoring" | "cpuTurn" | "done";

export interface PlayerCard {
  scores: Partial<Record<Category, number>>;
  yahtzeeBonus: number; // multiples of 100
}

export interface YahtzeeFullMatchState {
  settings: YahtzeeFullMatchSettings;
  rngSeed: number;
  round: number;        // 1..13
  turn: "player" | "cpu";
  rollsUsed: number;    // 0..3
  dice: Die[];          // 5 dice
  phase: Phase;
  player: PlayerCard;
  cpu: PlayerCard;
  message: string;
}

export type YahtzeeFullMatchAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: Category }
  | { type: "cpuTurn" };

function emptyCard(): PlayerCard {
  return { scores: {}, yahtzeeBonus: 0 };
}

export function initialState(seed: number, settings: YahtzeeFullMatchSettings): YahtzeeFullMatchState {
  return {
    settings,
    rngSeed: seed >>> 0,
    round: 1,
    turn: "player",
    rollsUsed: 0,
    dice: [
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
    ],
    phase: "rolling",
    player: emptyCard(),
    cpu: emptyCard(),
    message: "Roll the dice to begin your turn.",
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const r = mulberry32(seed);
  // burn one value to derive the next seed
  const nextSeed = Math.floor(r() * 2 ** 31) >>> 0;
  return { rng: mulberry32(seed), nextSeed };
}

export function isYahtzee(dice: readonly Die[]): boolean {
  return scoreYahtzee(dice) === 50;
}

/** Apply joker rule: if dice are a Yahtzee AND the matching upper-section box
 *  is already filled, Full House / Small Straight / Large Straight may
 *  auto-score their fixed value (25/30/40). Otherwise normal rules apply. */
export function computeCategoryScore(
  dice: readonly Die[],
  category: Category,
  card: PlayerCard,
): number {
  // Plain scoring first
  let base = 0;
  switch (category) {
    case "aces":  base = scoreOfAKindUpper(dice, 1); break;
    case "twos":  base = scoreOfAKindUpper(dice, 2); break;
    case "threes": base = scoreOfAKindUpper(dice, 3); break;
    case "fours": base = scoreOfAKindUpper(dice, 4); break;
    case "fives": base = scoreOfAKindUpper(dice, 5); break;
    case "sixes": base = scoreOfAKindUpper(dice, 6); break;
    case "threeOfAKind":  base = scoreNOfAKind(dice, 3); break;
    case "fourOfAKind":   base = scoreNOfAKind(dice, 4); break;
    case "fullHouse":     base = scoreFullHouse(dice); break;
    case "smallStraight": base = scoreSmallStraight(dice); break;
    case "largeStraight": base = scoreLargeStraight(dice); break;
    case "yahtzee":       base = scoreYahtzee(dice); break;
    case "chance":        base = scoreChance(dice); break;
  }

  // Joker rule: if dice are a yahtzee and the corresponding upper box is
  // already filled, FH/SS/LS auto-score their fixed values.
  if (isYahtzee(dice)) {
    const face = dice[0]!.value;
    const upperCat = UPPER_CATEGORIES[face - 1]!;
    const upperFilled = upperCat in card.scores;
    if (upperFilled) {
      if (category === "fullHouse") return 25;
      if (category === "smallStraight") return 30;
      if (category === "largeStraight") return 40;
    }
  }
  return base;
}

/** Which categories are legal to choose given current dice + card.
 *  All unfilled categories are legal in standard Yahtzee — a player may always
 *  "scratch" a 0 into any open box. We still expose this for the CPU's view. */
export function unusedCategories(card: PlayerCard): Category[] {
  return ALL_CATEGORIES.filter((c) => !(c in card.scores));
}

/** Total of upper section (excluding bonus). */
export function upperSum(card: PlayerCard): number {
  let s = 0;
  for (const c of UPPER_CATEGORIES) s += card.scores[c] ?? 0;
  return s;
}

export function upperBonus(card: PlayerCard): number {
  return upperSum(card) >= 63 ? 35 : 0;
}

export function totalScore(card: PlayerCard): number {
  let s = 0;
  for (const c of ALL_CATEGORIES) s += card.scores[c] ?? 0;
  return s + upperBonus(card) + card.yahtzeeBonus;
}

function applyScore(card: PlayerCard, dice: readonly Die[], category: Category): PlayerCard {
  let bonus = card.yahtzeeBonus;
  // Yahtzee chip: if dice are a yahtzee AND the yahtzee box has already been
  // scored with 50, add a +100 chip regardless of which category is chosen.
  if (isYahtzee(dice) && (card.scores["yahtzee"] ?? 0) === 50) {
    bonus += 100;
  }
  const points = computeCategoryScore(dice, category, card);
  const scores = { ...card.scores, [category]: points };
  return { scores, yahtzeeBonus: bonus };
}

/** Heuristic: pick the unused category that maximises immediate points,
 *  with mild ties broken toward filling upper section first (to chase the
 *  +35 bonus) and toward keeping the Chance box open. */
export function cpuChooseCategory(card: PlayerCard, dice: readonly Die[]): Category {
  const unused = unusedCategories(card);
  if (unused.length === 0) return "chance";
  // Score each unused category, with bonus weighting.
  let best: Category = unused[0]!;
  let bestVal = -1;
  for (const cat of unused) {
    let v = computeCategoryScore(dice, cat, card);
    // Prefer upper section when close to 63 (chasing the bonus).
    if (UPPER_CATEGORIES.includes(cat)) {
      const u = upperSum(card);
      if (u < 63) v += Math.min(8, Math.max(0, 4 - Math.max(0, u - 50) / 8));
    }
    // Heavily disprefer scratching a 0 into yahtzee/largeStraight/fullHouse early.
    if (v === 0) {
      if (cat === "yahtzee") v -= 50;
      else if (cat === "largeStraight") v -= 30;
      else if (cat === "fullHouse") v -= 20;
      else if (cat === "smallStraight") v -= 15;
      else if (UPPER_CATEGORIES.includes(cat)) v -= 5;
      else if (cat === "chance") v -= 25; // save Chance
    }
    if (v > bestVal) { bestVal = v; best = cat; }
  }
  return best;
}

/** Decide which dice the CPU should keep before re-rolling, then reroll the
 *  rest. Simple greedy heuristic: hold the highest-count face, plus any 5s
 *  and 6s if we already have no pair. */
function cpuKeepMask(dice: readonly Die[]): boolean[] {
  const counts = faceCounts(dice);
  // Find face with max count
  let bestFace: DieFace = 1;
  let bestCount = 0;
  for (let f = 6; f >= 1; f--) {
    const ff = f as DieFace;
    if (counts[ff] > bestCount) {
      bestCount = counts[ff];
      bestFace = ff;
    }
  }
  if (bestCount >= 2) {
    // Keep the matching dice
    return dice.map((d) => d.value === bestFace);
  }
  // No pair: keep dice showing 4, 5, or 6 (high-value singles for straights/chance)
  return dice.map((d) => d.value >= 5);
}

export function reducer(state: YahtzeeFullMatchState, action: YahtzeeFullMatchAction): YahtzeeFullMatchState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "roll": {
      if (state.turn !== "player") return state;
      if (state.phase !== "rolling") return state;
      if (state.rollsUsed >= 3) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = state.rollsUsed === 0 ? rollDice(5, rng) : rerollUnkept(state.dice, rng);
      const rollsUsed = state.rollsUsed + 1;
      const phase: Phase = rollsUsed >= 3 ? "scoring" : "rolling";
      return {
        ...state,
        rngSeed: nextSeed,
        rollsUsed,
        dice: newDice,
        phase,
        message: rollsUsed < 3
          ? `Roll ${rollsUsed} of 3 — tap dice to hold, then re-roll or score.`
          : "Final roll — pick a category to score.",
      };
    }

    case "toggleKeep": {
      if (state.turn !== "player") return state;
      if (state.phase !== "rolling") return state;
      if (state.rollsUsed === 0) return state;
      return { ...state, dice: toggleKeep(state.dice, action.index) };
    }

    case "score": {
      if (state.turn !== "player") return state;
      if (state.rollsUsed === 0) return state;
      if (action.category in state.player.scores) return state;

      const newCard = applyScore(state.player, state.dice, action.category);
      const playerDone = unusedCategories(newCard).length === 0;
      // After player scores, hand turn to CPU (if CPU hasn't finished its 13 rows yet).
      const cpuDone = unusedCategories(state.cpu).length === 0;
      const allDone = playerDone && cpuDone;

      if (allDone) {
        return {
          ...state,
          player: newCard,
          phase: "done",
          rollsUsed: 0,
          dice: state.dice.map((d) => ({ ...d, kept: false })),
          message: "Match complete.",
        };
      }

      // CPU plays its turn next (if it still has rows).
      if (!cpuDone) {
        return {
          ...state,
          player: newCard,
          turn: "cpu",
          rollsUsed: 0,
          dice: state.dice.map((d) => ({ ...d, kept: false })),
          phase: "cpuTurn",
          message: "CPU is rolling…",
        };
      }

      // CPU already done — straight to next player turn / done check above already
      // handled allDone, so we just advance the round and stay on player.
      return {
        ...state,
        player: newCard,
        round: state.round + 1,
        turn: "player",
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
        phase: "rolling",
        message: "Your turn — roll the dice.",
      };
    }

    case "cpuTurn": {
      if (state.turn !== "cpu") return state;
      if (state.phase !== "cpuTurn") return state;
      if (unusedCategories(state.cpu).length === 0) {
        // Shouldn't happen — guard
        const playerDone = unusedCategories(state.player).length === 0;
        return {
          ...state,
          turn: "player",
          phase: playerDone ? "done" : "rolling",
          round: state.round + 1,
          rollsUsed: 0,
        };
      }

      // Simulate CPU rolling up to 3 times. We advance the RNG seed through
      // the same advanceSeed machinery so the whole game is deterministic by
      // seed alone.
      let seed = state.rngSeed;
      const step = () => {
        const { rng, nextSeed } = advanceSeed(seed);
        seed = nextSeed;
        return rng;
      };
      // Roll 1
      let dice = rollDice(5, step());
      // Roll 2 — keep heuristic
      let mask = cpuKeepMask(dice);
      dice = dice.map((d, i) => (mask[i] ? { ...d, kept: true } : { ...d, kept: false }));
      dice = rerollUnkept(dice, step());
      // Roll 3
      mask = cpuKeepMask(dice);
      dice = dice.map((d, i) => (mask[i] ? { ...d, kept: true } : { ...d, kept: false }));
      dice = rerollUnkept(dice, step());

      const cat = cpuChooseCategory(state.cpu, dice);
      const newCpu = applyScore(state.cpu, dice, cat);
      const cpuDone = unusedCategories(newCpu).length === 0;
      const playerDone = unusedCategories(state.player).length === 0;

      if (cpuDone && playerDone) {
        return {
          ...state,
          rngSeed: seed,
          cpu: newCpu,
          phase: "done",
          turn: "player",
          rollsUsed: 0,
          dice: state.dice.map((d) => ({ ...d, kept: false })),
          message: "Match complete.",
        };
      }

      return {
        ...state,
        rngSeed: seed,
        cpu: newCpu,
        turn: "player",
        round: state.round + 1,
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
        phase: "rolling",
        message: `CPU scored ${CATEGORY_LABELS[cat]} for ${newCpu.scores[cat] ?? 0}. Your turn.`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: YahtzeeFullMatchState): { score: number } | null {
  if (state.phase !== "done") return null;
  const p = totalScore(state.player);
  const c = totalScore(state.cpu);
  // Leaderboard score: player total + 100 win bonus if we beat CPU.
  // If player loses or ties we still return their total — that surfaces
  // a meaningful number rather than a zero.
  const winBonus = p > c ? 100 : 0;
  return { score: p + winBonus };
}
