import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NobelLaureatesQuizState, NobelLaureatesQuizAction, NobelLaureatesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NobelLaureatesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nobelLaureatesQuizPlugin: GamePlugin<NobelLaureatesQuizState, NobelLaureatesQuizAction, typeof settings> = {
  id:"nobel-laureates-quiz", title:"Nobel Laureates Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Winners of the world's most prestigious prize across every category.",
  howToPlay:"Nobel Laureates Quiz tests your knowledge of recipients of the Nobel Prize. Questions span Physics, Chemistry, Medicine, Literature, Peace and Economics — covering year of award, country of laureate, contribution to science or culture, and the world-changing breakthroughs that earned them the highest honor in their field.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. The world's most distinguished honor — see how well you know its champions of science, peace and the arts.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NobelLaureatesQuizSettings),
  reducer,isTerminal,component:NobelLaureatesQuizGame,
};
