import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaFiveCardHiState, OmahaFiveCardHiAction, OmahaFiveCardHiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmahaFiveCardHiGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const omahaFiveCardHiPlugin: GamePlugin<OmahaFiveCardHiState, OmahaFiveCardHiAction, typeof settings> = {
  id:"omaha-five-card-hi", title:"Omaha 5-Card Hi Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Five-card Omaha Hi solo: ten cards dealt, best five-card poker hand scored.",
  howToPlay:"Omaha 5-Card Hi Solo is the action-heavy big-brother of Omaha Hi. Press Deal to receive ten cards (five hole + five community) and the best five-card poker hand is scored.\n\nHand rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn real 5-Card Omaha you must use exactly two hole cards plus three community cards — but the five hole cards make every imaginable combination more probable. This solo deal version simply picks your best five from the ten.\n\nSix rounds. Expect Full Houses every other round on average and the occasional Straight Flush. Press Next between rounds and see how high you can push your ten-card best.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmahaFiveCardHiSettings),
  reducer, isTerminal,   hint: (state: OmahaFiveCardHiState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-omaha-five-card-hi-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-omaha-five-card-hi-next"]', pulses: 3 };
    return null;
  },
  component:OmahaFiveCardHiGame,
};
