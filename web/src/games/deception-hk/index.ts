import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeceptionHkState, DeceptionHkAction, DeceptionHkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeceptionHkGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const deceptionHkPlugin: GamePlugin<DeceptionHkState, DeceptionHkAction, typeof settings> = {
  id: "deception-hk",
  title: "Deception: Murder Mystery Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on the forensic-bluff classic Deception: Murder in Hong Kong.`,
  howToPlay: `Deception: Murder Mystery Quiz tests your knowledge of the 2014 hidden-role investigation classic by Tobey Ho. One player is the Murderer; the Forensic Scientist (a separate hidden role) is the moderator-with-clues. Investigators (the Resistance side) deduce the Means and Clue from limited tile information.

Across 10 multiple-choice questions you'll cover: role lineup (Murderer, Forensic Scientist, Investigators, Accomplice, Witness), how the scientist reveals tiles, why bluff-Murderer naming Means/Clue is critical, and the Witness expansion's two-way deduction twist.

Each correct answer is 100 points (1000 max).

Tips: in Deception, the Forensic Scientist's tile choices are constrained but not random — patterns (e.g., always picking a generic answer) become tells. Murderers can survive by leaning into innocent-looking deductions; the Witness expansion adds a layer where the Witness knows the Murderer but is at risk of being murdered for outing them.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeceptionHkSettings),
  reducer,
  isTerminal,
  component: DeceptionHkGame,
};
