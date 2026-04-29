import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LadyOfTheManorState, LadyOfTheManorAction, LadyOfTheManorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LadyOfTheManorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ladyOfTheManorPlugin: GamePlugin<LadyOfTheManorState, LadyOfTheManorAction, typeof settings> = {
  id:"lady-of-the-manor", title:"Lady of the Manor", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sir Tommy variant with six waste piles.",
  howToPlay:"Lady of the Manor is a compact 10-round solitaire micro-variant inspired by Lady of the Manor: Sir Tommy variant with six waste piles. Each round you receive a fresh hand of five cards drawn from a single seeded deck. You then choose one of three actions. Keep & Score locks the current hand and awards points based on the variant's special bonus rule. Discard Hand abandons it for a flat one-point consolation and rolls into the next round. Swap consumes the next deck card to replace any single card in the visible hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between 40 and 120 total points; sharp swap usage and well-timed Keeps can push past that. The game ends automatically when ten rounds are reached or the deck is exhausted, and your final score is rated Pass, Fair, Good, or Excellent depending on the total earned.\n\nThe deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Compress carefully and the bonus rule will reward you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LadyOfTheManorSettings),
  reducer,isTerminal,component:LadyOfTheManorGame,
};
