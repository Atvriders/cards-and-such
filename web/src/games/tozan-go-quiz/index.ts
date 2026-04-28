import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TozanGoState, TozanGoAction, TozanGoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TozanGoGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tozanGoPlugin: GamePlugin<TozanGoState, TozanGoAction, typeof settings> = {
  id:"tozan-go-quiz", title:"Tozan Go Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Tozan Go, the inverted-handicap teaching variant.",
  howToPlay:"Tozan Go ('uphill Go') is a teaching Go variant where the handicap system is inverted: the weaker player takes black (which would normally play first) but with the additional advantage of placing extra stones, while the stronger player faces a literal uphill struggle. The variant is designed to make matches between mismatched players more competitive and to give learners a real chance against teachers without changing the deeper rules of Go.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TozanGoSettings),
  reducer,isTerminal,component:TozanGoGame,
};
