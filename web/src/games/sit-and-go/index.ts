import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SitAndGoState, SitAndGoAction, SitAndGoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SitAndGoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sitAndGoPlugin: GamePlugin<SitAndGoState, SitAndGoAction, typeof settings> = {
  id:"sit-and-go", title:"Sit & Go Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo single-table SnG poker; eight rounds simulating tournament arc.",
  howToPlay:"Sit & Go Solo simulates the single-table SnG format that starts when seats fill, typically nine or ten players. Press Deal each round to receive seven cards (two hole + five community) and the engine evaluates the best five-card hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds reflect a typical SnG arc.\n\nSnG strategy is well-defined: tight early, aggressive on the bubble, push-fold heavy at three-handed and heads-up. Most edge comes from understanding ICM at the money jump. Here you grind eight rounds, simulating the early-mid-late arc of an SnG. Press Next after each round to navigate the bubble!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SitAndGoSettings),
  reducer, isTerminal,   hint: (state: SitAndGoState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-sit-and-go-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sit-and-go-next"]', pulses: 3 };
    return null;
  },
  component:SitAndGoGame,
};
