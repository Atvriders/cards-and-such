import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HachiHachiState, HachiHachiAction, HachiHachiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HachiHachiGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hachiHachiQuizPlugin: GamePlugin<HachiHachiState, HachiHachiAction, typeof settings> = {
  id:"hachi-hachi-quiz", title:"Hachi-Hachi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hachi-Hachi, the eight-eight Hanafuda gambling variant.",
  howToPlay:"Hachi-Hachi (literally 'Eight-Eight') is a popular Japanese gambling Hanafuda game traditionally played by three players. Each round runs through the twelve months of the deck and uses a complex scoring system based on yaku and base point values. The target score is 88 — hence the name. Hachi-Hachi requires sharper play than Koi-Koi because all three players score simultaneously and the bookkeeping rewards careful card-counting.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HachiHachiSettings),
  reducer,isTerminal,component:HachiHachiGame,
};
