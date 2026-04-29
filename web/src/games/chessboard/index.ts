import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChessboardState, ChessboardAction, ChessboardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChessboardGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chessboardPlugin: GamePlugin<ChessboardState, ChessboardAction, typeof settings> = {
  id:"chessboard", title:"Chessboard", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 10-round solitaire micro-variant inspired by Chessboard.",
  howToPlay:"Chessboard is a compact 10-round solitaire micro-variant inspired by Free-cell-like patience with 64 tableau cells; each placement awards points by colour and suit. Each round you receive a fresh hand of five cards drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the current hand and awards points based on the variant's special bonus rule; Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the visible hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between 40 and 120 total points; sharp swap usage and well-timed Keeps can push past that. The game ends automatically when ten rounds are reached or the deck is exhausted, and your final score is rated Pass, Fair, Good, or Excellent depending on the total earned.\n\nThe deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Slot carefully and the bonus rule will reward you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChessboardSettings),
  reducer,isTerminal,component:ChessboardGame,
};
