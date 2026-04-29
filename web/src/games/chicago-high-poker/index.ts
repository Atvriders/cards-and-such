import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChicagoHighPokerState, ChicagoHighPokerAction, ChicagoHighPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChicagoHighPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chicagoHighPokerPlugin: GamePlugin<ChicagoHighPokerState, ChicagoHighPokerAction, typeof settings> = {
  id:"chicago-high-poker", title:"Chicago (High)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Chicago High: 7-Stud-style deal where the highest spade in the hole would normally win half the pot.",
  howToPlay:"Chicago High is a 7-Card Stud side-pot game where the highest spade dealt to a player's hole splits the pot with the best hand. In this solo version you focus only on the main poker scoring — but you can keep mental track of the spades you see and notice when a high spade aligns with a strong made hand.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and reports the strongest hand: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. Imagine the rounds where the ace of spades shows up as bonus-track sessions, and the rounds without spades as straight poker drills. Press Next after each round and chase the highest cumulative score you can manage from your eight Chicago-High deals.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChicagoHighPokerSettings),
  reducer,isTerminal,component:ChicagoHighPokerGame,
};
