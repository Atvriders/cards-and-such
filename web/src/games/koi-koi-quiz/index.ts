import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KoiKoiState, KoiKoiAction, KoiKoiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KoiKoiGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const koiKoiPlugin: GamePlugin<KoiKoiState, KoiKoiAction, typeof settings> = {
  id:"koi-koi-quiz", title:"Koi-Koi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Japanese Hanafuda matching game Koi-Koi.",
  howToPlay:"Koi-Koi is the most famous Hanafuda game in Japan. Two players match flower cards in their hands with cards on the table to capture them, with the goal of forming yaku (scoring combinations) like Inoshikacho, Hanami-zake, or Tsukimi-zake. The name 'Koi-Koi' literally means 'come on, come on' — what you shout when you decide to keep playing for a bigger yaku at the risk of letting your opponent overtake you.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KoiKoiSettings),
  reducer,isTerminal,
  hint: (state: KoiKoiState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KoiKoiGame,
};
