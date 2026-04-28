import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuiplashQuizState, QuiplashQuizAction, QuiplashQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuiplashQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quiplashQuizPlugin: GamePlugin<QuiplashQuizState, QuiplashQuizAction, typeof settings> = {
  id: "quiplash-quiz",
  title: "Quiplash Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Quiplash, Jackbox prompt-based humor party game.",
  howToPlay: "Quiplash Trivia covers Jackbox's clever prompt-and-punchline party game where players type funny answers head-to-head and the audience picks the winner. Quiplash and its sequels are crown jewels of the Jackbox library.\n\nTen multiple-choice questions cover the original Quiplash, Quiplash 2, Quiplash 3, the Thriplash final round, the smartphone interface, scoring, audience involvement, and the famous prompt format that pits two anonymous answers against each other.\n\nTap A, B, C, or D and press Submit. Correct earns 100 points; wrong earns zero and reveals the right answer.\n\nUse Next to continue, Finish on the last question. Quiplash rewards quick wits and reads of your friend group's sense of humor — but this trivia rewards good Jackbox memory. Whether you've spent dozens of streams watching Quiplash crack rooms up, this round is a tribute to one of party gaming's funniest engines.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuiplashQuizSettings),
  reducer, isTerminal, component: QuiplashQuizGame,
};
