import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSpiralState, CardSpiralAction, CardSpiralSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSpiralGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSpiralPlugin: GamePlugin<CardSpiralState, CardSpiralAction, typeof settings> = {
  id:"card-spiral", title:"Card Spiral", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a spiral of cards in non-decreasing rank order across 12 draws.",
  howToPlay:`Card Spiral is a deck-building decision sprint over 12 draws. On each turn you press Draw to flip a fresh card from the deck. You then choose: Keep the card to add it to your growing spiral, or Discard to send it to the trash and move on.

Rule for keeping: the card must have a rank greater than or equal to the most recent card you've kept. The first card kept is always legal. If you try to Keep an out-of-order card, the rule is enforced — you'll lose 5 points but the spiral stays the same.

Scoring: each successful Keep awards 15 points; an attempted but illegal Keep loses 5 points; Discards are free. Aces count as 1, Kings as 13.

Strategy: discards are unlimited and free, so use them when a low card threatens a tall spiral; once you've kept a 10 or higher, almost any further card costs you. The maximum theoretical score is 180 (every keep legal). Aim for 100+.

Press Draw to begin and shape your spiral.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSpiralSettings),
  reducer, isTerminal, component: CardSpiralGame,
};
