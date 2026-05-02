import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuartetQuestState, QuartetQuestAction, QuartetQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuartetQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quartetQuestPlugin: GamePlugin<QuartetQuestState, QuartetQuestAction, typeof settings> = {
  id:"quartet-quest", title:"Quartet Quest", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 16 cards. Score 60 points each time you complete four of a kind.",
  howToPlay:`Quartet Quest is a luck-based card collection mini. You draw cards one at a time from a shuffled deck, and your hand grows on screen. Each time you complete four-of-a-kind — all four Kings, all four 5s, anything — you score 60 points.

You only score on the fourth copy. The first three of any rank give zero. There are 16 draws total, so you have a good chance of completing one quartet, sometimes two.

Since the deck contains exactly four of each rank, every rank you fully complete is a guaranteed 60. With 16 draws and 13 ranks, the math leans toward 1-2 quartets per game. Truly lucky runs reach 3.

There's no skill — pure draw-and-reveal. Tap Draw, watch the rank counts climb in the hand display, and shout when that fourth match lands. Your final score is your quartet count times 60. Aim for 60+ and consider yourself a quartet champion!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuartetQuestSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-quartet-quest-primary"]', pulses: 3 }),component:QuartetQuestGame,
};
