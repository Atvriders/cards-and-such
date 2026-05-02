import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraightSearchState, StraightSearchAction, StraightSearchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StraightSearchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const straightSearchPlugin: GamePlugin<StraightSearchState, StraightSearchAction, typeof settings> = {
  id:"straight-search", title:"Straight Search", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find a 5-card straight in 10 random draws — bonus for straight flushes.",
  howToPlay:`Straight Search is a poker mini where every draw is a roll of the dice. Each round you press Draw 5 and get five random cards from a fresh deck. If they happen to form a straight (five consecutive ranks like 5-6-7-8-9, or A-2-3-4-5, or 10-J-Q-K-A), you score 200 points. If they're also all the same suit (a straight flush), you get a 50-point bonus, for a total of 250.

There are 10 draws per game. With a fully random deal, the probability of getting a straight is small — roughly 0.4% per draw — and a straight flush is far rarer still. So expect most draws to be quiet, but each lucky hit is a big reward.

Just press Draw 5, watch the cards land, and click Next to move on. The game ends after 10 draws, and your final score is the sum of every straight you found. May the deck be kind!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StraightSearchSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-straight-search-primary"]', pulses: 3 }),component:StraightSearchGame,
};
