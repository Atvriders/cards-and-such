import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaglanPatienceState, RaglanPatienceAction, RaglanPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaglanPatienceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const raglanPatiencePlugin: GamePlugin<RaglanPatienceState, RaglanPatienceAction, typeof settings> = {
  id:"raglan-patience", title:"Raglan", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 10-round solitaire micro-variant inspired by Raglan.",
  howToPlay:"Raglan is a compact 10-round solitaire micro-variant inspired by King Albert with 6 cells, aces pre-placed; tailored hands of even ranks earn the Raglan-sleeve bonus. Each round you receive a fresh hand of five cards drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the current hand and awards points based on the variant's special bonus rule; Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the visible hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between 40 and 120 total points; sharp swap usage and well-timed Keeps can push past that. The game ends automatically when ten rounds are reached or the deck is exhausted, and your final score is rated Pass, Fair, Good, or Excellent depending on the total earned.\n\nThe deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Sleeve carefully and the bonus rule will reward you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RaglanPatienceSettings),
  reducer,isTerminal,component:RaglanPatienceGame,
};
