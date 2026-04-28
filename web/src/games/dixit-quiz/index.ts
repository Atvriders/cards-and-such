import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DixitQuizState, DixitQuizAction, DixitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DixitQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dixitQuizPlugin: GamePlugin<DixitQuizState, DixitQuizAction, typeof settings> = {
  id: "dixit-quiz",
  title: "Dixit Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Dixit, the surreal storytelling party game.",
  howToPlay: "Dixit Trivia tests your knowledge of Jean-Louis Roubira's surreal-illustration storytelling game published by Libellud. Players take turns being the storyteller, giving a clue for one of their cards, and trying to be guessed correctly by some — but not all — other players.\n\nTen multiple-choice questions cover scoring rules, the famous illustrations of Marie Cardouat, expansion sets, Dixit Odyssey's standalone format, the bunny rabbit scoring tokens, the year of release, and the awards Dixit has won (notably Spiel des Jahres 2010).\n\nTap A, B, C, or D and press Submit. Correct answers earn 100 points, wrong answers earn zero but reveal the right answer.\n\nPress Next between questions and Finish on the final one. A great score celebrates Dixit as one of the most beloved abstract storytelling games of the modern era — equal parts gallery visit, party game, and creative-writing exercise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DixitQuizSettings),
  reducer, isTerminal, component: DixitQuizGame,
};
