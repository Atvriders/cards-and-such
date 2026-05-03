import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPaddleState, CardPaddleAction, CardPaddleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPaddleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPaddlePlugin: GamePlugin<CardPaddleState, CardPaddleAction, typeof settings> = {
  id:"card-paddle", title:"Card Paddle", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Paddle cards into a target suit pile. 12 draws; suit match = +15.",
  howToPlay:"Card Paddle is a 12-round suit-paddle game. Each round you choose a target suit pile to paddle the next drawn card into. If the drawn card's suit matches your paddle direction, you bank 15 points; otherwise the round scores nothing.\n\nEach suit covers 13 of 52 cards, giving a 25% chance per round if you call randomly. Across 12 rounds, expected score is around 30-60 points; a hot run cracks 100, and a perfect paddle 12-for-12 brings the table-topping 180.\n\nTap a suit symbol to set your paddle, watch the deck draw, and see the result. Press Next to advance.\n\nThe simple twist: choosing a suit you've seen recently has no effect — every draw is from a freshly shuffled deck. Card Paddle is pure suit-prediction fun with a satisfying paddle-and-pile vibe.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPaddleSettings),
  reducer,isTerminal, hint: (state: CardPaddleState): HintTarget | null => (state.phase === "predict" ? { selector: '[data-testid="hint-target-card-paddle-primary"]', pulses: 3 } : null),component:CardPaddleGame,
};
