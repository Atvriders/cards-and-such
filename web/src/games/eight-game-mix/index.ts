import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EightGameMixState, EightGameMixAction, EightGameMixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EightGameMixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eightGameMixPlugin: GamePlugin<EightGameMixState, EightGameMixAction, typeof settings> = {
  id:"eight-game-mix", title:"8-Game Mix Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo 8-Game Mix: deal six cards each round, best five-card high scored.",
  howToPlay:"8-Game Mix Solo simulates the prestigious 8-Game rotation: 2-7 Triple Draw, Limit Hold'em, No-Limit Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo, and Pot-Limit Omaha. Press Deal each round and receive six cards; the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live play, mastering eight games is a serious test of poker breadth. The 8-Game rotation pretty much demands tournament-level skill in every variant. Here we abstract the rotation into a single steady deal — your seeded pool provides the variance.\n\nTen rounds. Expect moderately high averages because the six-card spread produces frequent pair-and-better outcomes. Press Next between rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EightGameMixSettings),
  reducer,isTerminal,component:EightGameMixGame,
};
