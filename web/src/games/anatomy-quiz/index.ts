import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnatomyQuizState, AnatomyQuizAction, AnatomyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnatomyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const anatomyQuizPlugin: GamePlugin<AnatomyQuizState, AnatomyQuizAction, typeof settings> = {
  id:"anatomy-quiz", title:"Human Anatomy Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of organs, bones, and human body systems.",
  howToPlay:"Human Anatomy Quiz challenges you on the structure of the human body: organs, bones, muscles, the nervous system, the cardiovascular system, and more. Questions cover everything from how many bones an adult has to which organ produces insulin and where the smallest bone in the body lives.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Perfect for biology students, medical school hopefuls, or anyone fascinated by the incredible machine that is the human body!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AnatomyQuizSettings),
  reducer,isTerminal,component:AnatomyQuizGame,
};
