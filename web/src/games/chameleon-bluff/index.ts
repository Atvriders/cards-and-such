import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChameleonBluffState, ChameleonBluffAction, ChameleonBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChameleonBluffGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const chameleonBluffPlugin: GamePlugin<ChameleonBluffState, ChameleonBluffAction, typeof settings> = {
  id: "chameleon-bluff",
  title: "Chameleon Bluff Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on The Chameleon's hidden-role word-grid bluff.`,
  howToPlay: `The Chameleon Strategy Quiz tests your knowledge of Rikki Tahta's 2017 hidden-role word game. Most players see a secret word from a 4×4 word grid; one player (the Chameleon) does not. Each player gives a one-word clue. The group then votes on who is the Chameleon.

Across 10 multiple-choice questions you'll cover: how secret words are determined (dice → grid coordinate), why the Chameleon must give a vague clue that survives both the inquisition and the final guess if accused, and why "too obvious" clues mark non-Chameleons as fakes.

Each correct answer is 100 points (1000 max).

Tips: as a Chameleon, give a clue that's plausible for several grid words — never guess outright. As a non-Chameleon, calibrate your clue to confirm the secret without overshooting. Voting often hinges on subtle clue specificity differences.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChameleonBluffSettings),
  reducer,
  isTerminal,
  component: ChameleonBluffGame,
};
