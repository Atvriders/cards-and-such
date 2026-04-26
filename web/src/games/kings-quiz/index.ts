import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingsState, KingsAction, KingsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingsQuiz } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kingsQuizPlugin: GamePlugin<KingsState, KingsAction, typeof settings> = {
  id: "kings-quiz", title: "Kings Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's greatest kings — from Henry VIII and Charlemagne to Ramesses and Alexander the Great.",
  howToPlay: `Kings Quiz spans three thousand years of royal history, from the pharaohs of ancient Egypt to the monarchs of 20th-century Europe. Questions cover conquests, nicknames, battles, buildings, and the legendary deeds that made these rulers famous — or infamous.

You have 15 seconds to answer each question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining on the clock. Answer quickly and accurately for the best score.

Click your choice and press Submit. Correct answers highlight green; wrong selections turn red. Press Next to advance.

Settings let you choose 10, 20, or 30 questions from a pool of 30 covering kings of England, France, Prussia, Persia, Egypt, the Aztec Empire, the Mughal Empire, and many more.

From Henry VIII's six marriages to Shaka Zulu's military reforms, this quiz tests both familiar history and fascinating facts about the men who wore the crown!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as KingsSettings),
  reducer, isTerminal, component: KingsQuiz,
};
