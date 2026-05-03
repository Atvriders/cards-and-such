import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PokerDiceClState, PokerDiceClAction, PokerDiceClSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PokerDiceClGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pokerDiceClPlugin: GamePlugin<PokerDiceClState, PokerDiceClAction, typeof settings> = {
  id:"poker-dice-cl", title:"Poker Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Poker Dice, the bluffing dice game with poker hands.",
  howToPlay:"Poker Dice Trivia is a ten-question quiz about Poker Dice, a classic dice game where players roll five poker-faced dice (with faces 9, 10, J, Q, K, A) and form poker hands. Each player rolls all five dice, then may re-roll any subset up to two more times (three rolls total). The hands rank as in poker: high card, pair, two pair, three-of-a-kind, straight, full house, four-of-a-kind, five-of-a-kind. The highest hand wins. Variants include adding a betting round between rolls. Each question tests rules, hand rankings, dice faces, and history of Poker Dice. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Poker Dice gives all the thrill of poker with a dozen seconds of dice-shaking instead of card-dealing.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PokerDiceClSettings),
  reducer,isTerminal,
  hint: (state: PokerDiceClState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-poker-dice-cl-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-poker-dice-cl-submit"]', pulses: 3 };
  },
  component:PokerDiceClGame,
};
