import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipPinchState, PipPinchAction, PipPinchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipPinchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipPinchPlugin: GamePlugin<PipPinchState, PipPinchAction, typeof settings> = {
  id:"pip-pinch", title:"Pip Pinch", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pinch out high-pip cards. Score 1 point per remaining low card; bonus for clearing all highs.",
  howToPlay:`Pip Pinch is a single-deal card sorting game. You're dealt 12 cards face up. Your task: tap (pinch) up to six high-pip cards to remove them, leaving as many low-pip cards (Ace through 6) on the table as possible.

Pip values follow the standard scheme: 2 through 10 face value, J=11, Q=12, K=13, and Ace = 1. "Low" cards score; "high" cards (anything 7 or above) cost you points if left behind. Each remaining low card scores +1 point at the end. If you successfully pinch out every single high card from your hand, you earn a 5-point bonus.

The challenge: you only get six pinches, but the deal might include seven or more high cards. Choose carefully — pinch the highest first, save your pinches for the worst offenders, and aim for a clean sweep.

Maximum score is 17 (12 lows + 5 bonus, if all dealt cards happen to be low). Press Finish & Score when satisfied.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipPinchSettings),
  reducer,isTerminal,component:PipPinchGame,
};
