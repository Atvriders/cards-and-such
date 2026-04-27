import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCallState, CardCallAction, CardCallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCallGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCallPlugin: GamePlugin<CardCallState, CardCallAction, typeof settings> = {
  id:"card-call", title:"Card Call", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict whether the next card will be Red or Black. 16 rounds; +10 per correct call.",
  howToPlay:`Card Call is a fast 16-round prediction game. Each round, simply call the color of the next card to be flipped: Red (hearts and diamonds) or Black (spades and clubs). Get it right, score 10 points; get it wrong, score zero. The deck is reshuffled each round, so each call is a true 50/50 — no card-counting tricks here.

Tap your prediction (Red or Black), watch the card flip, and see whether your gut feel was right. After the result, press Next to move to the next round. The cycle repeats for 16 rounds, giving a maximum possible score of 160 points and an expected average around 80.

Card Call is a quick coin-flip-style game built around the rhythm of card flipping. Streaks happen, but luck reigns. The pleasure is in the flip, the suspense, and the brief satisfaction of a correct call.

Settle in, trust your gut, and let the cards decide!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCallSettings),
  reducer,isTerminal,component:CardCallGame,
};
