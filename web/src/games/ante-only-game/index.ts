import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnteOnlyGameState, AnteOnlyGameAction, AnteOnlyGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnteOnlyGameGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const anteOnlyGamePlugin: GamePlugin<AnteOnlyGameState, AnteOnlyGameAction, typeof settings> = {
  id:"ante-only-game", title:"Ante-Only Game Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo ante-only poker; no blinds, every player posts equal.",
  howToPlay:"Ante-Only Game Solo simulates the format where every player posts a single ante instead of standard blinds. Press Deal each round to receive seven cards and the engine grades the best five-card poker hand among all 21 possible combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds — nine ante-pot scenarios.\n\nLive ante-only play removes positional disadvantages from blinds and tends to encourage looser opening ranges. Pots start bigger relative to stacks because everyone has skin in the game. Here every round you ante in equally and chase the best hand. Press Next to grind through nine balanced ante deals!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AnteOnlyGameSettings),
  reducer,isTerminal,component:AnteOnlyGameGame,
};
