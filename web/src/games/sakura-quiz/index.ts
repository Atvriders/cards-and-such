import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SakuraState, SakuraAction, SakuraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SakuraGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sakuraPlugin: GamePlugin<SakuraState, SakuraAction, typeof settings> = {
  id:"sakura-quiz", title:"Sakura Hanafuda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Sakura, the simplified Hanafuda game for Western players.",
  howToPlay:"Sakura is a modern simplified Hanafuda-style game designed to teach Western players the basics of Japanese flower-card matching without the heavy yaku tables of Koi-Koi or Hachi-Hachi. The deck is often re-themed with Western-friendly art, retaining the twelve flower months but reducing scoring to simple captured-card counts. Sakura sits between Hana Awase and Koi-Koi in complexity and is popular as a gateway product.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SakuraSettings),
  reducer,isTerminal,component:SakuraGame,
};
