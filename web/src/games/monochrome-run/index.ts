import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonochromeRunState, MonochromeRunAction, MonochromeRunSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonochromeRunGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const monochromeRunPlugin: GamePlugin<MonochromeRunState, MonochromeRunAction, typeof settings> = {
  id:"monochrome-run", title:"Monochrome Run", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 12 cards. Long same-color streaks score the most points.",
  howToPlay:`Monochrome Run is a streak-collection card mini built around color momentum. Draw 12 cards one at a time. Each card is either red (hearts and diamonds) or black (spades and clubs). When a card matches the color of the previous card, it extends your current streak and earns 1 point.

When the color changes, the streak resets to 1 (no points awarded for the first card of any new streak). The longer you keep one color rolling, the more points you stack — and your best streak length is shown at the end as a bonus stat.

Each card draw is independent, so a 50/50 color flip means streaks of 4 or 5 are uncommon and runs of 6+ are rare. Average scores hover around 5-7 points, but a lucky streak-heavy run can reach 10+.

Press Draw to flip a card; the streak counter updates instantly, and you can watch the run grow (or break). Game ends after 12 cards.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MonochromeRunSettings),
  reducer,isTerminal,component:MonochromeRunGame,
};
