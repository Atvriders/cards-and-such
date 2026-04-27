import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvenEvensState, EvenEvensAction, EvenEvensSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EvenEvensGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const evenEvensPlugin: GamePlugin<EvenEvensState, EvenEvensAction, typeof settings> = {
  id:"even-evens", title:"Even Evens", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw two cards each round; both even ranks scores 20 points. 12 draws total.",
  howToPlay:`Even Evens is a quick luck-based card game. Each draw, two cards are revealed from a shuffled deck. If both cards are even ranks (2, 4, 6, 8, 10, or Queen), you score 20 points for that draw. Mixed or odd-only pairs score nothing.

You'll do 12 draws per game. There's no skill choice each round — just press Draw and see what fortune brings. Average expected score is around 60 points (since slightly more than a third of pairs will be even-even), so anything above that means the deck loved you. Hit 100+ and you've had a lucky game indeed.

After each draw, press Next to continue. The game ends after the 12th draw and your final tally is your score. Settle in for a friendly few minutes — this is a coffee-break diversion, not a brain-burner.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EvenEvensSettings),
  reducer,isTerminal,component:EvenEvensGame,
};
