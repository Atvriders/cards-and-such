import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SequencePredictorState, SequencePredictorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SequencePredictorGame } from "./Game.js";

export const sequencePredictorSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["15", "20", "30"] as const,
    default: "15" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type SequencePredictorSettingsType = SettingsOf<typeof sequencePredictorSettings>;

export const sequencePredictorPlugin: GamePlugin<SequencePredictorState, SequencePredictorAction, typeof sequencePredictorSettings> = {
  id: "sequence-predictor",
  title: "Sequence Predictor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five numbers of a sequence appear on screen. Identify the pattern and type the next number.",
  howToPlay: `Sequence Predictor challenges you to recognise numeric patterns and extend them. Five numbers from a sequence are shown — for example 3, 6, 9, 12, 15 — and you must type the next number in the series, then press Enter to submit.

Three types of sequences appear: Arithmetic sequences increase or decrease by a constant amount each step (e.g., 2, 5, 8, 11, 14 — each term adds 3). Geometric sequences multiply by a constant ratio (e.g., 2, 4, 8, 16, 32 — each term doubles). Fibonacci-like sequences add the previous two terms together (e.g., 3, 5, 8, 13, 21). A label beneath the sequence tells you which type you're looking at, helping you apply the right strategy.

Each correct answer earns 10 points. Wrong answers score zero but advance the game. A progress bar tracks how far through the round you are.

Easy difficulty uses small numbers and simple step sizes. Medium introduces larger numbers and ratios. Hard can have large step sizes and bigger starting values.

Tips: For arithmetic, subtract any two consecutive terms to find the step. For geometric, divide one term by the previous one to find the ratio. For Fibonacci-like, check if each term equals the sum of the two before it.`,
  settings: sequencePredictorSettings,
  initialState: (seed: number, settings: SequencePredictorSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SequencePredictorState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-sequence-predictor-primary"]', pulses: 3 } : null),
  component: SequencePredictorGame,
};
