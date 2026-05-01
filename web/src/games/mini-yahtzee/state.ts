import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Category =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "threeOfAKind" | "fourOfAKind" | "fullHouse"
  | "smallStraight" | "largeStraight" | "yahtzee" | "chance";

export const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];

export const UPPER_CATEGORIES: Category[] = ["ones", "twos", "threes", "fours", "fives", "sixes"];

export const CATEGORY_LABELS: Record<Category, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  threeOfAKind: "Three of a Kind",
  fourOfAKind: "Four of a Kind",
  fullHouse: "Full House (25)",
  smallStraight: "Sm. Straight (30)",
  largeStraight: "Lg. Straight (40)",
  yahtzee: "YAHTZEE (50)",
  chance: "Chance",
};

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;
export interface DieS { value: DieFace; kept: boolean; }

export interface MiniYahtzeeSettings { dummy: boolean; }

export interface MiniYahtzeeState {
  rngSeed: number;
  round: number;            // 1..13
  rollsUsed: number;        // 0..3 within current round
  dice: DieS[];             // 5 dice
  scores: Partial<Record<Category, number>>;
  phase: "playing" | "done";
}

export type MiniYahtzeeAction =
  | { type: "roll" }
  | { type: "toggle"; idx: number }
  | { type: "score"; category: Category };

export function initialState(seed: number, _s: MiniYahtzeeSettings): MiniYahtzeeState {
  return {
    rngSeed: seed >>> 0,
    round: 1,
    rollsUsed: 0,
    dice: [
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
    ],
    scores: {},
    phase: "playing",
  };
}

function faceCounts(dice: DieS[]): Record<DieFace, number> {
  const c: Record<DieFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of dice) c[d.value]++;
  return c;
}

function sumAll(dice: DieS[]): number {
  return dice.reduce((s, d) => s + d.value, 0);
}

export function computeCategoryScore(dice: DieS[], cat: Category): number {
  const counts = faceCounts(dice);
  switch (cat) {
    case "ones":   return counts[1] * 1;
    case "twos":   return counts[2] * 2;
    case "threes": return counts[3] * 3;
    case "fours":  return counts[4] * 4;
    case "fives":  return counts[5] * 5;
    case "sixes":  return counts[6] * 6;
    case "threeOfAKind": {
      return Object.values(counts).some(n => n >= 3) ? sumAll(dice) : 0;
    }
    case "fourOfAKind": {
      return Object.values(counts).some(n => n >= 4) ? sumAll(dice) : 0;
    }
    case "fullHouse": {
      const vals = Object.values(counts);
      return vals.includes(3) && vals.includes(2) ? 25 : 0;
    }
    case "smallStraight": {
      const have = new Set(dice.map(d => d.value));
      for (const start of [1, 2, 3]) {
        let ok = true;
        for (let k = 0; k < 4; k++) if (!have.has((start + k) as DieFace)) { ok = false; break; }
        if (ok) return 30;
      }
      return 0;
    }
    case "largeStraight": {
      const have = new Set(dice.map(d => d.value));
      for (const start of [1, 2]) {
        let ok = true;
        for (let k = 0; k < 5; k++) if (!have.has((start + k) as DieFace)) { ok = false; break; }
        if (ok) return 40;
      }
      return 0;
    }
    case "yahtzee": {
      return Object.values(counts).some(n => n === 5) ? 50 : 0;
    }
    case "chance": return sumAll(dice);
  }
}

export function upperSubtotal(scores: Partial<Record<Category, number>>): number {
  return UPPER_CATEGORIES.reduce((s, c) => s + (scores[c] ?? 0), 0);
}

export function upperBonus(scores: Partial<Record<Category, number>>): number {
  return upperSubtotal(scores) >= 63 ? 35 : 0;
}

export function totalScore(scores: Partial<Record<Category, number>>): number {
  const sum = ALL_CATEGORIES.reduce((s, c) => s + (scores[c] ?? 0), 0);
  return sum + upperBonus(scores);
}

export function reducer(state: MiniYahtzeeState, action: MiniYahtzeeAction): MiniYahtzeeState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    if (state.rollsUsed >= 3) return state;
    const rng = mulberry32(state.rngSeed);
    const newDice: DieS[] = state.dice.map((d) => {
      if (state.rollsUsed === 0) return { value: ((Math.floor(rng() * 6) + 1) as DieFace), kept: false };
      if (d.kept) return d;
      return { value: ((Math.floor(rng() * 6) + 1) as DieFace), kept: false };
    });
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, rollsUsed: state.rollsUsed + 1, dice: newDice };
  }

  if (action.type === "toggle") {
    if (state.rollsUsed === 0 || state.rollsUsed >= 3) return state;
    const dice = state.dice.map((d, i) => i === action.idx ? { ...d, kept: !d.kept } : d);
    return { ...state, dice };
  }

  if (action.type === "score") {
    if (state.rollsUsed === 0) return state;
    if (action.category in state.scores) return state;
    const points = computeCategoryScore(state.dice, action.category);
    const newScores = { ...state.scores, [action.category]: points };
    const allFilled = ALL_CATEGORIES.every((c) => c in newScores);
    return {
      ...state,
      scores: newScores,
      round: state.round + 1,
      rollsUsed: 0,
      dice: state.dice.map((d) => ({ ...d, kept: false })),
      phase: allFilled ? "done" : "playing",
    };
  }

  return state;
}

export function isTerminal(state: MiniYahtzeeState): { score: number } | null {
  return state.phase === "done" ? { score: totalScore(state.scores) } : null;
}
