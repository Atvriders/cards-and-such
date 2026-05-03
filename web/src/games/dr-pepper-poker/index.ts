import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrPepperPokerState, DrPepperPokerAction, DrPepperPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrPepperPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const drPepperPokerPlugin: GamePlugin<DrPepperPokerState, DrPepperPokerAction, typeof settings> = {
  id:"dr-pepper-poker", title:"Dr. Pepper Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Dr. Pepper poker: 7-card Stud variant where 2s, 4s, and 10s would be wild (10-2-4 = Dr Pepper). Score the best five-card hand.",
  howToPlay:"Dr. Pepper poker is a wild-card Stud variant whose name comes from the soda's 10-2-4 advertising slogan: twos, fours, and tens are all wild. Hands of multiple wilds are common and silly. This solo edition skips the wild-card bookkeeping and just deals seven cards each round so you can score honest poker on the seven-card pool.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and selects the strongest hand: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. When the random deal sends a 10, a 2, and a 4 your way, raise an imaginary toast — those are the cards Dr Pepper would have made wild. Press Next between rounds and stack up the highest cumulative score across your full Dr Pepper Poker session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DrPepperPokerSettings),
  reducer,isTerminal,  hint: (state: DrPepperPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-dr-pepper-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dr-pepper-poker-next"]', pulses: 3 };
    return null;
  },
  component:DrPepperPokerGame,
};
