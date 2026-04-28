import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardYankState, CardYankAction, CardYankSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardYankGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardYankPlugin: GamePlugin<CardYankState, CardYankAction, typeof settings> = {
  id:"card-yank", title:"Card Yank", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Yank specific suits from a hand of 7: 8 rounds.",
  howToPlay:"Card Yank deals you 7 random cards across 8 rounds. After dealing, a target suit is revealed and every card matching that suit scores 10 points. The matching cards are highlighted automatically so you can see exactly how many you yanked.\n\nPress Yank to deal the hand and reveal the target. Press Next to advance to the next round. The target suit is randomized per round, and 7 cards average 1.75 matches per deal (7 times 25 percent) for an expected 17 points per round and around 140 across 8 rounds.\n\nBig hands of 3 or more matching cards happen about 24 percent of the time. These score 30 or more points and quickly elevate your final tally. Conversely, suit-poor hands (0 or 1 matches) drag the average down. Card Yank is pure variance entertainment with quick deal cycles; finishing with 200 or more points means the deck favored you, and finishing with 250 or more is genuinely lucky.\n\nPull, count, advance, repeat: Card Yank is fast suit-spotting fun.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardYankSettings),
  reducer,isTerminal,component:CardYankGame,
};
