import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JacksJamboreeState, JacksJamboreeAction, JacksJamboreeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JacksJamboreeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jacksJamboreePlugin: GamePlugin<JacksJamboreeState, JacksJamboreeAction, typeof settings> = {
  id:"jacks-jamboree", title:"Jacks Jamboree", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing jacks; +100 per jack across 10 random 5-card draws.",
  howToPlay:"Jacks Jamboree is a quick and lively card mini. Each round, you press Deal and get five random cards from a fresh 52-card deck. Every Jack in your hand earns 100 points \u2014 and there are only four Jacks in the deck, so each one is something to celebrate.\n\nYou play 10 draws total. With 4 jacks in 52 cards and 5 cards per round, you'll average around 0.38 jacks per hand, so a typical run ends near 300 points. A lucky multi-jack hand, though, is where Jacks Jamboree really earns its name. Matched jacks are highlighted in gold to make scoring easy.\n\nNo decisions, no strategy \u2014 just push Deal and see what the deck delivers. After 10 rounds the final tally is locked in. Have fun and may the jacks be plentiful!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JacksJamboreeSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-jacks-jamboree-primary"]', pulses: 3 }),component:JacksJamboreeGame,
};
