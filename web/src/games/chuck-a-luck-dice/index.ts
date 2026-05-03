import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChuckALuckDiceState, ChuckALuckDiceAction, ChuckALuckDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChuckALuckDiceGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chuckALuckDicePlugin: GamePlugin<ChuckALuckDiceState, ChuckALuckDiceAction, typeof settings> = {
  id:"chuck-a-luck-dice", title:"Chuck-a-Luck", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Chuck-a-Luck, the casino three-dice betting game.",
  howToPlay:"Chuck-a-Luck Trivia is a ten-question quiz about Chuck-a-Luck (also called Birdcage or Sweat), a casino dice game where three dice are tumbled in a wire cage and players bet on which numbers will appear. Bets include single numbers (1-6), 'big' (sum 11-17), 'small' (sum 4-10), 'any triple', or specific triples. Payouts vary: matching one die pays 1:1, matching two pays 2:1, and matching all three pays 10:1 (with house rules pushing the rate higher in some casinos). The house edge is significant. Each question tests rules, payouts, names, and history of Chuck-a-Luck. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChuckALuckDiceSettings),
  reducer,isTerminal,
  hint: (state: ChuckALuckDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-chuck-a-luck-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-chuck-a-luck-dice-submit"]', pulses: 3 };
  },
  component:ChuckALuckDiceGame,
};
