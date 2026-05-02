import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTowerStackState, CardTowerStackAction, CardTowerStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTowerStackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTowerStackPlugin: GamePlugin<CardTowerStackState, CardTowerStackAction, typeof settings> = {
  id:"card-tower-stack", title:"Card Tower Stack", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stack 12 cards into a tower. Higher ranks add more height (and points).",
  howToPlay:"Card Tower Stack is a 12-card stacking mini. Each round you draw a card and place it on the tower. The card's rank value (2 through Ace = 14) is added to your score directly. So 2's add 2 points, while Aces add 14.\\n\\nThe maximum possible score over 12 cards is 168 (all Aces); the minimum is 24 (all 2's). The expected average draw is 8 (the average rank value), so a typical run scores around 96 points.\\n\\nThere's no choice or skill; the deck does the work. Just keep drawing and stacking, watching the tower grow. Each card is drawn fresh with replacement so the same rank can repeat. Press Draw to add a card to the tower, see how many points it adds, then Next to keep stacking. After 12 cards your tower is complete and your final score is locked in. Build tall, build lucky!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTowerStackSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-tower-stack-primary"]', pulses: 3 }),component:CardTowerStackGame,
};
