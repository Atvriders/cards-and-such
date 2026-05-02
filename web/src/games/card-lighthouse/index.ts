import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLighthouseState, CardLighthouseAction, CardLighthouseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardLighthouseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardLighthousePlugin: GamePlugin<CardLighthouseState, CardLighthouseAction, typeof settings> = {
  id:"card-lighthouse", title:"Card Lighthouse", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Light up specific cards by suit. Target-suit picks score big. 12 rounds.",
  howToPlay:"Card Lighthouse asks you to illuminate cards of the right color through twelve foggy nights. Each round, five cards drift through the lighthouse beam. The target suit lights up brightest: matching cards score (rank index + 5), so a 2 of target = 5, a King of target = 16, an Ace of target = 17.\n\nCards from any other suit are dim — they only score 3 each, regardless of rank.\n\nThe strategy: scan for the highest rank in the target suit. If no target-suit card is dealt that round, just take any card for the 3 consolation points.\n\nYou play 12 rounds. Each suit has 13 of 52 cards (25%), so you'll usually have at least one target-suit card. Expected scores typically land around 100-160, with strong runs (where high-rank target cards keep showing) pushing 180+.\n\nA simple navigation game — guide the ships home with your lantern!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardLighthouseSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-lighthouse-primary"]', pulses: 3 }), component:CardLighthouseGame,
};
