import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrawfulQuizState, DrawfulQuizAction, DrawfulQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrawfulQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const drawfulQuizPlugin: GamePlugin<DrawfulQuizState, DrawfulQuizAction, typeof settings> = {
  id: "drawful-quiz",
  title: "Drawful Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Drawful, Jackbox draw-and-vote party game.",
  howToPlay: "Drawful Trivia covers Jackbox's signature drawing-then-voting party game where players sketch absurd prompts on their phones and audiences howl at the results. The game evolved through multiple editions and Drawful 2 became a free pandemic-era staple.\n\nTen multiple-choice questions test you on release dates, voting mechanics, prompt style, the Jackbox Pack lineups Drawful belongs to, scoring methods, the maximum player count, and the role of the audience.\n\nPick A, B, C, or D and press Submit. Correct earns 100 points; wrong earns zero but reveals the right answer.\n\nPress Next to continue, Finish on the final question. Drawful is famously easy to play (it requires no artistic skill, only chaos), and this trivia round respects that ethos: no question requires you to draw anything, only to know enough about Jackbox lore to claim bragging rights at your next remote game night.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DrawfulQuizSettings),
  reducer, isTerminal, component: DrawfulQuizGame,
};
