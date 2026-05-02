import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OddOllieState, OddOllieAction, OddOllieSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OddOllieGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const oddOlliePlugin: GamePlugin<OddOllieState, OddOllieAction, typeof settings> = {
  id:"odd-ollie", title:"Odd Ollie", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score on odd-pip cards (3,5,7,9,J,K,A). 12 draws; +20 per odd.",
  howToPlay:"Odd Ollie is the flipside of Even Eddy: you score points whenever you draw a card with an odd pip value — 3, 5, 7, 9, Jack (11), King (13), or Ace (1). Seven ranks are 'odd,' which is 28 cards out of 52 — roughly 53.8% of the deck.\n\nYou draw 12 cards. Each odd card scores 20 points; even cards (2, 4, 6, 8, 10, Q=12) score zero. Expect around 130 points on a typical run (6-7 odds per game). The maximum is 240 points (twelve straight odd cards), but that's a freakishly lucky outcome.\n\nPress Draw, see the card, press Next. There's no skill or strategy — just enjoy the rhythm of odd-vs-even cards and chase your personal high. A simple, satisfying card mini for one-handed casual play sessions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OddOllieSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-odd-ollie-primary"]', pulses: 3 }),component:OddOllieGame,
};
