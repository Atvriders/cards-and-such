import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingsCourtState, KingsCourtAction, KingsCourtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingsCourtGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kingsCourtPlugin: GamePlugin<KingsCourtState, KingsCourtAction, typeof settings> = {
  id:"kings-court", title:"Kings Court", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing kings; +100 per king across 10 random 5-card draws.",
  howToPlay:"Kings Court is a fast and simple card mini. Each round, you press Deal and get five fresh cards from a random deck. Every King in your hand is worth 100 points \u2014 and there are only four Kings in a 52-card deck, so spotting one is always a small celebration.\n\nYou play 10 draws total. With 4 kings in 52 cards and 5 cards drawn per round, you'd expect to see roughly 0.38 kings per hand on average \u2014 so a typical run lands around 300 points, but a hot streak with multiple kings in one hand can easily push your score much higher. Matched kings are highlighted in gold so you can see at a glance how many you scored.\n\nNo strategy, no decisions \u2014 just push Deal, see what comes out, and chase the royals. After 10 rounds your final tally is locked in. May the deck favor you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KingsCourtSettings),
  reducer,isTerminal,component:KingsCourtGame,
};
