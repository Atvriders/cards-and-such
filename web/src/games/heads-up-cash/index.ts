import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeadsUpCashState, HeadsUpCashAction, HeadsUpCashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HeadsUpCashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const headsUpCashPlugin: GamePlugin<HeadsUpCashState, HeadsUpCashAction, typeof settings> = {
  id:"heads-up-cash", title:"Heads-Up Cash Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo heads-up cash simulation with extreme range play.",
  howToPlay:"Heads-Up Cash Solo models the 2-max format where every hand is contested between two players, leading to extreme swings and premium-on-position. Press Deal each round to receive seven cards and the engine evaluates the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds total at heads-up pace.\n\nHeads-up cash is poker stripped to its essentials: every hand is a button-versus-blind battle and every leak gets exposed. Top players widen ranges to almost any-two cards in position. Here you face nine independent draws — no folding, just maximum equity capture. Press Next to chase a heads-up high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HeadsUpCashSettings),
  reducer,isTerminal,  hint: (state: HeadsUpCashState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-heads-up-cash-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-heads-up-cash-next"]', pulses: 3 };
    return null;
  },
  component:HeadsUpCashGame,
};
