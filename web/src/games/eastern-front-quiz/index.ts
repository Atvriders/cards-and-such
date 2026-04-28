import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EasternFrontQuizState, EasternFrontQuizAction, EasternFrontQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EasternFrontQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const easternFrontQuizPlugin: GamePlugin<EasternFrontQuizState, EasternFrontQuizAction, typeof settings> = {
  id:"eastern-front-quiz", title:"Eastern Front Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"WWII Eastern Front: Operation Barbarossa to Berlin.",
  howToPlay:"Eastern Front Quiz pulls 10, 20, or 30 random questions from a curated pool. You get 15 seconds per question and every second remaining adds 10 bonus points to a correct answer's base 100, so quick confident answers crush slow ones.\n\nTap a choice (A, B, C, or D) to select it, then press Submit. Correct answers glow green and the right answer is always revealed before you advance, so you learn even when you miss. Wrong answers earn no points: there is no partial credit.\n\nPress Next to continue. Questions are drawn from the same shared pool, but the seed and shuffle order vary, so every session feels fresh. The answer order itself is randomized so you cannot memorize positional patterns.\n\nChoose the question count in Settings. Average runs land in the 800-1500 point range; sharp answers under 5 seconds can push you well past 2000 over a 20-question session. Sharpen up and play through the rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EasternFrontQuizSettings),
  reducer,isTerminal,component:EasternFrontQuizGame,
};
