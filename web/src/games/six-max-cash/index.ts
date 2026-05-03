import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SixMaxCashState, SixMaxCashAction, SixMaxCashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SixMaxCashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sixMaxCashPlugin: GamePlugin<SixMaxCashState, SixMaxCashAction, typeof settings> = {
  id:"six-max-cash", title:"6-Max Cash Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo poker simulating 6-max cash game aggression and wide ranges.",
  howToPlay:"6-Max Cash Solo simulates the short-handed cash format capped at six players. Press Deal each round to receive seven cards (two hole + five community) and the engine selects the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds simulate eight orbits at a 6-max table.\n\nLive 6-max play is more aggressive than full ring: with fewer players blinds come faster and ranges widen significantly. Suited connectors and small pairs play better in 6-max because you see more flops. Here each deal models a 6-max hand. Press Next to grind eight orbits for a 6-max-style aggregate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SixMaxCashSettings),
  reducer, isTerminal,   hint: (state: SixMaxCashState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-six-max-cash-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-six-max-cash-next"]', pulses: 3 };
    return null;
  },
  component:SixMaxCashGame,
};
