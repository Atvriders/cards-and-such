import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PotLimitOmahaState, PotLimitOmahaAction, PotLimitOmahaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PotLimitOmahaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const potLimitOmahaPlugin: GamePlugin<PotLimitOmahaState, PotLimitOmahaAction, typeof settings> = {
  id:"pot-limit-omaha", title:"Pot-Limit Omaha (PLO)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Pot-Limit Omaha: classic four-hole-card PLO. Deal seven cards and score the best five-card poker hand.",
  howToPlay:"Pot-Limit Omaha is the king of action games — four hole cards, must use exactly two with three from the board, and bet sizes capped at the size of the pot. The four-hole-card structure produces nutted hands all the time, leading to massive pots and dramatic swings. This solo trainer condenses everything into a seven-card deal (your hole + board sample) and the reducer scores the best five.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. PLO is famously a game of action and big hands; your seven-card pool keeps the trend alive with frequent two-pair and trips. Press Next between rounds and chase the highest cumulative score across the full PLO session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PotLimitOmahaSettings),
  reducer,isTerminal,component:PotLimitOmahaGame,
  hint: (state: PotLimitOmahaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-pot-limit-omaha-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-pot-limit-omaha-next"]', pulses: 3 };
    return null;
  },
};
