import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriadTowerState, TriadTowerAction, TriadTowerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriadTowerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const triadTowerPlugin: GamePlugin<TriadTowerState, TriadTowerAction, typeof settings> = {
  id:"triad-tower", title:"Triad Tower", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 3 cards each round; +30 if all share a suit. 8 rounds.",
  howToPlay:`Triad Tower is a quick suit-matching card mini. Each of 8 rounds, three cards are drawn from a fresh deck. If all three cards share the same suit (all hearts, all spades, all diamonds, or all clubs), you score 30 points. If they don't all match, the round scores zero — no partial credit.

The probability that 3 random cards share a suit is roughly 5%, so most rounds won't pay out. When fortune does deliver a clean triple, you'll feel like the deck is on your side. There's no choice within a round; the cards are pure fate, and you just press Deal 3 to see what comes out.

A typical run lands at 0–30 points. A two-triad run is a great game; three triads is exceptional and probably means the seed loved you. Press Next between rounds to keep moving, and watch the suits stack up!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TriadTowerSettings),
  reducer,isTerminal,component:TriadTowerGame,
};
