import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HwatuState, HwatuAction, HwatuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HwatuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hwatuPlugin: GamePlugin<HwatuState, HwatuAction, typeof settings> = {
  id:"hwatu-quiz", title:"Hwatu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Korean Hwatu flower card deck and its games.",
  howToPlay:"Hwatu (literally 'flower fight') is the Korean adaptation of the Japanese Hanafuda flower deck. Brought to Korea during the Japanese occupation, the cards were re-manufactured in plastic by Korean producers and became wildly popular. Hwatu is the foundation of multiple Korean games — Go-Stop is the most famous, but Min-Hwatu, Seotda, and Matgo also use the deck. The 48-card pack still depicts twelve flower months.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HwatuSettings),
  reducer,isTerminal,component:HwatuGame,
};
