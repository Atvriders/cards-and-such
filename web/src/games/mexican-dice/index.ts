import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicanDiceState, MexicanDiceAction, MexicanDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MexicanDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mexicanDicePlugin: GamePlugin<MexicanDiceState, MexicanDiceAction, typeof settings> = {
  id:"mexican-dice", title:"Mexican Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two dice with special scoring: Mexican (2-1), doubles, and sums. 12 rounds.",
  howToPlay:`Mexican Dice is a 12-round mini based on the classic two-dice bar game. Each round you press Roll Two to fling a pair of d6s, and the result is scored using a special hierarchy:

Mexican! A 2 and a 1 (any order) is the top result, worth a flat 200 points. It only happens about 5.6% of the time but it's a big payday when it does.

Doubles. Any matching pair (1-1, 2-2, ... 6-6) scores the face value times 100. So 1-1 is 100, 6-6 is 600. Doubles happen about 16.7% of the time, with all six pairs equally likely.

Plain sum. Anything else just scores the total of the two dice — anywhere from 3 to 11.

Twelve rounds in all. The expected value per roll works out to around 75 points, so a typical run lands in the 700-1000 point range. A lucky string of doubles or a Mexican will push you well into the four-digit territory!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MexicanDiceSettings),
  reducer,isTerminal,
  hint: (state: MexicanDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-mexican-dice-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mexican-dice-next"]', pulses: 3 };
    return null;
  },
  component:MexicanDiceGame,
};
