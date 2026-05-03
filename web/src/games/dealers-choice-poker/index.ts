import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DealersChoicePokerState, DealersChoicePokerAction, DealersChoicePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DealersChoicePokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dealersChoicePokerPlugin: GamePlugin<DealersChoicePokerState, DealersChoicePokerAction, typeof settings> = {
  id:"dealers-choice-poker", title:"Dealer's Choice Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Dealer's Choice rotation: deal six cards per round, best five-card high scored.",
  howToPlay:"Dealer's Choice Solo translates the home-game ritual into a single-player loop. In live Dealer's Choice, the dealer for each hand picks the variant — leading to chaotic and creative session arcs. Here, press Deal each round to receive six cards; the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThe wide-open variant choice in live Dealer's Choice keeps everyone on their toes. The seeded six-card deal here mimics that variability — every seed plays differently.\n\nTen rounds. The point distribution will range from low-end pair runs to occasional full houses. Press Next between rounds and play with different seeds to chase your best.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DealersChoicePokerSettings),
  reducer,isTerminal,  hint: (state: DealersChoicePokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-dealers-choice-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dealers-choice-poker-next"]', pulses: 3 };
    return null;
  },
  component:DealersChoicePokerGame,
};
