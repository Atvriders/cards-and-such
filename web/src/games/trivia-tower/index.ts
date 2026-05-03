import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriviaTowerState, TriviaTowerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriviaTower } from "./Game.js";

export const triviaTowerSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20"] as const,
    default: "10" as const,
  },
} as const;

type TriviaTowerSettingsType = SettingsOf<typeof triviaTowerSettings>;

export const triviaTowerPlugin: GamePlugin<TriviaTowerState, TriviaTowerAction, typeof triviaTowerSettings> = {
  id: "trivia-tower",
  title: "Trivia Tower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Answer trivia correctly to stack blocks on your tower. Wrong answers knock a block off!",
  howToPlay: `Trivia Tower is a trivia game where correct answers build your tower taller and wrong answers make it wobble and lose a block.

Each round shows a multiple-choice question with four options. Select the answer you believe is correct and press Submit. If you are right, one block is added to your tower. If you are wrong, one block is removed (minimum of zero). Watch the tower grow and shrink in real time as you play.

The goal is to have the tallest tower at the end of all rounds. Your score is calculated from your final block count plus your highest block count reached at any point during the game, rewarding sustained accuracy.

There is no time limit per question, so take your time and think carefully. However, the questions span a wide range of topics and difficulties, so even confident players may face surprises.

Choose 10 or 20 rounds in settings. The questions are shuffled randomly each game, so no two sessions are the same. Challenge yourself to reach a perfect tower where every answer is correct!`,
  settings: triviaTowerSettings,
  initialState: (seed: number, settings: TriviaTowerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  
  hint: (state: TriviaTowerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-trivia-tower-answer-0"]', pulses: 3 } : null,component: TriviaTower,
};
