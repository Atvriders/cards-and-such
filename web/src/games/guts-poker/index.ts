import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GutsPokerState, GutsPokerAction, GutsPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GutsPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gutsPokerPlugin: GamePlugin<GutsPokerState, GutsPokerAction, typeof settings> = {
  id:"guts-poker", title:"Guts Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo three-card guts; declare in or out for each pot.",
  howToPlay:"Guts Solo simulates the multi-round social poker game where each round players declare 'in' or 'out' on a three-card hand and losers must match the pot. Press Deal each round to receive three cards and the engine scores the strength.\n\nThree-card hand scoring: High Card 0, Pair 20, Flush 40, Straight 50, Three-of-a-Kind 100, Straight Flush 150 (mini scale for three-card hands). Nine rounds simulate the escalating-pot guts experience.\n\nIn live guts, declaring 'in' on a weak hand can be ruinous — losers match the pot, doubling it for the next round. Pots can grow exponentially across consecutive losers. Here you always 'declare in' and the engine grades your hand. Press Next to chase nine escalating pots and rack up score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GutsPokerSettings),
  reducer,isTerminal,component:GutsPokerGame,
  hint: (state: GutsPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-guts-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-guts-poker-next"]', pulses: 3 };
    return null;
  },
};
