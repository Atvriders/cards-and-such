import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { McrMahjongState, McrMahjongAction, McrMahjongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { McrMahjongGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mcrMahjongPlugin: GamePlugin<McrMahjongState, McrMahjongAction, typeof settings> = {
  id:"mcr-mahjong-quiz", title:"MCR Mahjong Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of MCR (Mahjong Competition Rules) tournament Mahjong.",
  howToPlay:"Mahjong Competition Rules (MCR), sometimes called the 'Chinese Official' ruleset, is the international tournament Mahjong standard. It was created to replace the patchwork of regional house rules with one consistent scoring framework. MCR scoring uses 81 distinct elements, ranging from low-value sets like Pung of Terminals (1 point) to exalted Big Four Winds (88 points). MCR is used at the World Mahjong Championship and most international team events.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as McrMahjongSettings),
  reducer,isTerminal,
  hint: (state: McrMahjongState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:McrMahjongGame,
};
