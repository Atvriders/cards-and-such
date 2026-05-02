import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CantoneseMahjongState, CantoneseMahjongAction, CantoneseMahjongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CantoneseMahjongGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cantoneseMahjongPlugin: GamePlugin<CantoneseMahjongState, CantoneseMahjongAction, typeof settings> = {
  id:"cantonese-mahjong-quiz", title:"Cantonese Mahjong Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Cantonese (Hong Kong-style) Mahjong scoring.",
  howToPlay:"Cantonese Mahjong (also called Hong Kong style) is the most widely played form of Mahjong in the world, used as the default in Hong Kong and southern China. The standard hand is 13 tiles plus the winning tile (14 in total), and the scoring is built on 'fan' — the more rare a hand's elements, the higher the fan and the score. Cantonese Mahjong uses chicken hands (no scoring elements) and limit hands (max payouts) and is famous for self-drawn (zimo) bonuses.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CantoneseMahjongSettings),
  reducer,isTerminal,
  hint: (state: CantoneseMahjongState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CantoneseMahjongGame,
};
