import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FollowTheQueenState, FollowTheQueenAction, FollowTheQueenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FollowTheQueenGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const followTheQueenPlugin: GamePlugin<FollowTheQueenState, FollowTheQueenAction, typeof settings> = {
  id:"follow-the-queen", title:"Follow the Queen", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Follow the Queen: deal seven Stud-style cards and score the best five-card hand. Whatever rank follows a queen would normally be wild.",
  howToPlay:"Follow the Queen is a 7-Card Stud variant where any rank dealt face-up immediately after a queen becomes wild for that hand. This solo version drops the wild-card bookkeeping and instead lets you enjoy the seven-card deal directly — perfect if you've ever wanted to hunt for the elusive queen-into-ace combo without the table chatter.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer scans every five-card subset and surfaces the strongest poker hand. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Imagine the queens you do see as the bookmark in the story; even without the wild-card kicker, the seven-card pool produces frequent two-pair and trips. Press Next after scoring each round and stack up your best total across all eight queens-or-no-queens deals.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FollowTheQueenSettings),
  reducer,isTerminal,  hint: (state: FollowTheQueenState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-follow-the-queen-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-follow-the-queen-next"]', pulses: 3 };
    return null;
  },
  component:FollowTheQueenGame,
};
