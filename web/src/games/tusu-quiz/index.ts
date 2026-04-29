import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TusuState, TusuAction, TusuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TusuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tusuGamePlugin: GamePlugin<TusuState, TusuAction, typeof settings> = {
  id:"tusu-quiz", title:"Tusu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Chinese Lunar New Year drinking dice game Tusu.",
  howToPlay:"Tusu is a Chinese Lunar New Year drinking dice game whose penalty rules are tied to traditional legends. Players roll dice and the loser of each round drinks a sip of tusu wine — a herbal medicinal wine traditionally consumed at New Year.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TusuSettings),
  reducer,isTerminal,component:TusuGame,
};
