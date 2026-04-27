import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MentalMathQuizState, MentalMathQuizAction, MentalMathQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MentalMathQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mentalMathQuizPlugin: GamePlugin<MentalMathQuizState, MentalMathQuizAction, typeof settings> = {
  id:"mental-math-quiz", title:"Mental Math Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quick mental arithmetic: addition, subtraction, multiplication, percentages.",
  howToPlay:"Mental Math Quiz puts your arithmetic chops to the test. Questions cover addition, subtraction, multiplication, division, percentages, fractions, and squares — all designed to be solvable in your head with no pencil. The goal is speed and accuracy: answer fast and correct to maximize your points.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points per second remaining on the clock — quick thinking really pays. Wrong answers score zero but the correct answer is revealed, so you learn for next time.\n\nTap a choice and press Submit. Green means correct, red means wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a mathlete, a casino card counter, or just want to keep your mental math sharp, this quiz is great daily brain exercise. No calculators allowed!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MentalMathQuizSettings),
  reducer,isTerminal,component:MentalMathQuizGame,
};
