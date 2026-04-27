import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlushFinderState, FlushFinderAction, FlushFinderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlushFinderGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const flushFinderPlugin: GamePlugin<FlushFinderState, FlushFinderAction, typeof settings> = {
  id:"flush-finder", title:"Flush Finder", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find a 5-card flush in 10 random draws — bonus for straight flushes.",
  howToPlay:`Flush Finder is a poker mini where every draw is a fresh five-card hand. Each round you press Draw 5 and get five random cards. If they all share the same suit (a flush — say five hearts or five spades), you score 200 points. If those flush cards are also consecutive in rank (a straight flush), you collect a 50-point bonus, for a total of 250.

There are 10 draws per game. The probability of a random five-card flush is about 0.2% — flushes are rare, but they're worth a lot when they hit. Most rounds you'll see a colorful mix of suits and walk away empty-handed; a single flush, though, can make or break your final tally.

Just press Draw 5, watch the cards land, and click Next to move on. The game ends after 10 draws, and your score sums every flush you found. Suit yourself!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlushFinderSettings),
  reducer,isTerminal,component:FlushFinderGame,
};
