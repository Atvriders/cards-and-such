import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TenGameMixState, TenGameMixAction, TenGameMixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TenGameMixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tenGameMixPlugin: GamePlugin<TenGameMixState, TenGameMixAction, typeof settings> = {
  id:"ten-game-mix", title:"10-Game Mix Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo 10-Game Mix: deal six cards per round, best five-card high scored.",
  howToPlay:"10-Game Mix Solo extends the 8-Game rotation by adding Badugi and Triple Draw variants. Press Deal each round to receive six cards from a 52-card deck and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThe 10-Game Mix in live play is the broadest mainstream rotation — you must be elite at every poker discipline. Here the seeded six-card seeded deal each round is a compromise width across the formats.\n\nTen rounds. Expect a similar score profile to 8-Game Mix. Press Next between rounds and run multiple seeds to test your luck across all ten format nominal rotations.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TenGameMixSettings),
  reducer, isTerminal,   hint: (state: TenGameMixState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-ten-game-mix-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-ten-game-mix-next"]', pulses: 3 };
    return null;
  },
  component:TenGameMixGame,
};
