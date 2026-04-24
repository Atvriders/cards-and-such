import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RollEmSettings {
  rounds: "3" | "5";
}

export type HandRank =
  | "nothing"
  | "one-pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "full-house"
  | "four-of-a-kind"
  | "five-of-a-kind";

export interface HandResult {
  rank: HandRank;
  label: string;
  score: number;
}

export interface RoundState {
  dice: number[];          // 5 dice values 1-6
  kept: boolean[];         // which dice are kept
  rollsLeft: number;       // starts at 2 (can roll twice after initial)
  result: HandResult | null;
}

export interface RollEmState {
  settings: RollEmSettings;
  rngSeed: number;
  totalRounds: number;
  round: number;
  current: RoundState;
  totalScore: number;
  history: HandResult[];
  botHistory: HandResult[];
  gameOver: boolean;
}

export type RollEmAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "endTurn" }
  | { type: "restart" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function rollDice(seed: number, count: number): { values: number[]; nextSeed: number } {
  let s = seed;
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    const rng = mulberry32(s);
    values.push(Math.floor(rng() * 6) + 1);
    s = nextSeed(s);
  }
  return { values, nextSeed: s };
}

function countValues(dice: number[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const d of dice) map.set(d, (map.get(d) ?? 0) + 1);
  return map;
}

export const HAND_SCORES: Record<HandRank, number> = {
  "nothing": 0,
  "one-pair": 100,
  "two-pair": 200,
  "three-of-a-kind": 350,
  "straight": 450,
  "full-house": 500,
  "four-of-a-kind": 700,
  "five-of-a-kind": 1000,
};

export function evaluateHand(dice: number[]): HandResult {
  const counts = countValues(dice);
  const vals = [...counts.values()].sort((a, b) => b - a);
  const sorted = [...dice].sort((a, b) => a - b);
  const isStraight = sorted[4]! - sorted[0]! === 4 && new Set(sorted).size === 5;

  let rank: HandRank;
  if (vals[0] === 5) rank = "five-of-a-kind";
  else if (vals[0] === 4) rank = "four-of-a-kind";
  else if (vals[0] === 3 && vals[1] === 2) rank = "full-house";
  else if (isStraight) rank = "straight";
  else if (vals[0] === 3) rank = "three-of-a-kind";
  else if (vals[0] === 2 && vals[1] === 2) rank = "two-pair";
  else if (vals[0] === 2) rank = "one-pair";
  else rank = "nothing";

  const LABELS: Record<HandRank, string> = {
    "nothing": "Nothing",
    "one-pair": "One Pair",
    "two-pair": "Two Pair",
    "three-of-a-kind": "Three of a Kind",
    "straight": "Straight",
    "full-house": "Full House",
    "four-of-a-kind": "Four of a Kind",
    "five-of-a-kind": "Five of a Kind!",
  };

  return { rank, label: LABELS[rank], score: HAND_SCORES[rank] };
}

function botPlayRound(seed: number): { result: HandResult; nextSeed: number } {
  // Bot: roll, keep any pairs/trips, roll again, keep, roll again
  let s = seed;
  let { values: dice, nextSeed: ns } = rollDice(s, 5);
  s = ns;

  // Two rerolls
  for (let r = 0; r < 2; r++) {
    const counts = countValues(dice);
    // Keep dice that appear more than once or are part of a straight
    const kept = dice.map(d => (counts.get(d) ?? 0) > 1);
    const rerollCount = kept.filter(k => !k).length;
    if (rerollCount === 0) break;
    const { values: newDice, nextSeed: ns2 } = rollDice(s, rerollCount);
    s = ns2;
    let ni = 0;
    dice = dice.map((d, i) => (kept[i] ? d : newDice[ni++]!));
  }

  const result = evaluateHand(dice);
  return { result, nextSeed: s };
}

function newRound(seed: number): { round: RoundState; nextSeed: number } {
  const { values: dice, nextSeed: ns } = rollDice(seed, 5);
  return {
    round: {
      dice,
      kept: [false, false, false, false, false],
      rollsLeft: 2,
      result: null,
    },
    nextSeed: ns,
  };
}

export function initialState(seed: number, settings: RollEmSettings): RollEmState {
  const s = seed >>> 0;
  const { round, nextSeed: ns } = newRound(s);
  return {
    settings,
    rngSeed: ns,
    totalRounds: parseInt(settings.rounds, 10),
    round: 1,
    current: round,
    totalScore: 0,
    history: [],
    botHistory: [],
    gameOver: false,
  };
}

export function reducer(state: RollEmState, action: RollEmAction): RollEmState {
  if (action.type === "restart") {
    return initialState(nextSeed(state.rngSeed), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "toggleKeep") {
    const { index } = action;
    const kept = [...state.current.kept];
    kept[index] = !kept[index];
    return { ...state, current: { ...state.current, kept } };
  }

  if (action.type === "roll") {
    if (state.current.rollsLeft <= 0) return state;
    const rerollIndices = state.current.kept.map((k, i) => k ? -1 : i).filter(i => i >= 0);
    const { values: newDice, nextSeed: ns } = rollDice(state.rngSeed, rerollIndices.length);
    const dice = [...state.current.dice];
    rerollIndices.forEach((idx, i) => { dice[idx] = newDice[i]!; });
    const rollsLeft = state.current.rollsLeft - 1;
    return {
      ...state,
      rngSeed: ns,
      current: { ...state.current, dice, rollsLeft, kept: [false, false, false, false, false] },
    };
  }

  if (action.type === "endTurn") {
    const result = evaluateHand(state.current.dice);
    const { result: botResult, nextSeed: ns } = botPlayRound(state.rngSeed);
    const playerScore = result.score;
    const roundScore = playerScore > botResult.score ? playerScore + 50 : playerScore > 0 ? playerScore : 0;
    const totalScore = state.totalScore + roundScore;
    const history = [...state.history, result];
    const botHistory = [...state.botHistory, botResult];
    const round = state.round + 1;
    const gameOver = round > state.totalRounds;

    if (gameOver) {
      return {
        ...state,
        rngSeed: ns,
        current: { ...state.current, result },
        totalScore,
        history,
        botHistory,
        round,
        gameOver: true,
      };
    }

    const { round: nextRound, nextSeed: ns2 } = newRound(ns);
    return {
      ...state,
      rngSeed: ns2,
      current: nextRound,
      totalScore,
      history,
      botHistory,
      round,
    };
  }

  return state;
}

export function isTerminal(state: RollEmState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.totalScore };
}
