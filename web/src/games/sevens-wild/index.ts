import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevensWildState, SevensWildAction, SevensWildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevensWildGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sevensWildPlugin: GamePlugin<SevensWildState, SevensWildAction, typeof settings> = {
  id:"sevens-wild", title:"Sevens Wild (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Sevens Wild video poker: theme variant where all sevens would normally be wild. Deal five cards, score the best hand.",
  howToPlay:"Sevens Wild is a video-poker paytable where every seven in the deck is a wild card, freely substituting for any rank or suit. The wild kicker dramatically inflates how often players hit straights, flushes, and quads. This solo trainer uses a clean 52-card deck (sevens count as themselves) so you can practice the basic deal-and-score loop without wild-card complications.\n\nPress Deal each round to receive five random cards. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Whenever a seven shows up, give it a wink — in the real Sevens Wild paytable that card would have been a wild and probably the difference-maker. Press Next between rounds and chase the highest cumulative score across the ten deals. Even without wilds, a single flush or straight in the right round can swing your total significantly.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SevensWildSettings),
  reducer,isTerminal,component:SevensWildGame,
  hint: (state: SevensWildState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-sevens-wild-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sevens-wild-next"]', pulses: 3 };
    return null;
  },
};
