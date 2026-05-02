import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTossState, CardTossAction, CardTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTossPlugin: GamePlugin<CardTossState, CardTossAction, typeof settings> = {
  id:"card-toss", title:"Card Toss", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Toss 12 cards into the right pile by color or face status.",
  howToPlay:`Card Toss is a quick-fire sorting card game. You're dealt 12 random cards one at a time, and you must toss each into the correct pile of three: the Red Pile (red number cards 2-10), the Black Pile (black number cards 2-10), or the Face Pile (any Jack, Queen, King, or Ace, regardless of suit color).

Each correct toss earns 25 points; incorrect tosses earn nothing and the card moves on. There are no penalties beyond zero, so always commit to a guess if unsure — wrong is no worse than skipping.

The game tests both color recognition and quick rank reading. Aces and faces are the trickiest, since their reds and blacks both go to the Face Pile, not the color piles. Get into a rhythm and don't overthink: red number cards go red, black number cards go black, anything fancier goes special.

A perfect run scores 300 points. Try to beat that on every play!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTossSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-toss-primary"]', pulses: 3 }), component:CardTossGame,
};
