import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LimitedFortyThievesState, LimitedFortyThievesAction, LimitedFortyThievesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LimitedFortyThievesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const limitedFortyThievesPlugin: GamePlugin<LimitedFortyThievesState, LimitedFortyThievesAction, typeof settings> = {
  id:"limited-forty-thieves", title:"Limited", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 10-round solitaire micro-variant inspired by Limited: Forty Thieves variant restricting moves to three cards per play.",
  howToPlay:"Limited is a compact 10-round solitaire micro-variant inspired by the classic patience: Forty Thieves variant restricting moves to three cards per play. Each round you receive a fresh hand of five cards drawn from a single seeded 52-card deck. You then choose one of three actions.\n\nKeep & Score locks the current hand and awards points based on face cards, pairs, ascending runs, and same-suit flushes, with a small variant-specific bonus that captures the flavor of Limited. Discard Hand abandons it for a flat one-point consolation and rolls into the next round. Swap consumes the next deck card to replace any single card in the visible hand without ending the round, which is your main tactical lever for shaping a strong Keep.\n\nScores compound across all ten rounds. Disciplined swap usage and well-timed Keeps will push your total well past a typical run. The game ends when ten rounds elapse or the deck runs out, and your final score is rated Pass, Fair, Good, or Excellent. Deals are fully seeded so identical seeds always produce identical card orders for fair comparison and replay.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LimitedFortyThievesSettings),
  reducer,isTerminal,component:LimitedFortyThievesGame,
};
