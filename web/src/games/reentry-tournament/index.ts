import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReentryTournamentState, ReentryTournamentAction, ReentryTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReentryTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const reentryTournamentPlugin: GamePlugin<ReentryTournamentState, ReentryTournamentAction, typeof settings> = {
  id:"reentry-tournament", title:"Re-Entry Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo re-entry poker; busting allows a fresh start with new stack.",
  howToPlay:"Re-Entry Tournament Solo models the format where players who bust early may re-enter as a brand new entry rather than rebuy on top. Press Deal to receive seven cards (two hole + five community) and the best five-card hand is automatically scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds total — each is an independent entry.\n\nRe-entry tournaments encourage volume play: busting is forgiven if registration is still open. Pros often re-enter four or five times in a single event. Here every round is a fresh entry: an independent draw with no carryover penalty. Stack premium hands across all nine entries to build the leaderboard score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReentryTournamentSettings),
  reducer,isTerminal,component:ReentryTournamentGame,
};
