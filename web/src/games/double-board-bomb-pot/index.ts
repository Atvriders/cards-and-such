import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleBoardBombPotState, DoubleBoardBombPotAction, DoubleBoardBombPotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleBoardBombPotGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleBoardBombPotPlugin: GamePlugin<DoubleBoardBombPotState, DoubleBoardBombPotAction, typeof settings> = {
  id:"double-board-bomb-pot", title:"Double Board Bomb Pot Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Double Board Bomb Pot: deal nine cards, best high hand scored.",
  howToPlay:"Double Board Bomb Pot Solo channels the bomb-pot ritual where everyone antes and two community boards are run. Press Deal each round to receive nine random cards (two hole + seven across two simulated boards); the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live play, bomb pots skip preflop betting — everyone antes to see the flop. With two boards, the action is doubled. Here the structural mirror is concentrated rounds with a wide nine-card pool.\n\nSix rounds. With nine cards, Full Houses are common and even Straight Flushes appear more often than in any other listed variant. Press Next between rounds for a high-octane Bomb Pot session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoubleBoardBombPotSettings),
  reducer,isTerminal,  hint: (state: DoubleBoardBombPotState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-double-board-bomb-pot-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-double-board-bomb-pot-next"]', pulses: 3 };
    return null;
  },
  component:DoubleBoardBombPotGame,
};
