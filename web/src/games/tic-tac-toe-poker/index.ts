import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToePokerState, TicTacToePokerAction, TicTacToePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TicTacToePokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ticTacToePokerPlugin: GamePlugin<TicTacToePokerState, TicTacToePokerAction, typeof settings> = {
  id:"tic-tac-toe-poker", title:"Tic-Tac-Toe Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Tic-Tac-Toe Poker: 3x3 community grid theme. Receive seven cards and score the best five-card poker hand.",
  howToPlay:"Tic-Tac-Toe Poker arranges nine community cards in a 3x3 grid — players combine their hole cards with a complete row, column, or diagonal to form a hand, choosing the best of eight possible board lines. This solo edition condenses the experience: we deal seven cards (your hole pair plus the line you pretend to choose) and the reducer scores the best five-card combination.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. Imagine each round as picking the strongest of three rows, three columns, and two diagonals — your seven cards stand in for the winning line plus your hole. Press Next between rounds and chase the highest cumulative score across the full eight-round Tic-Tac-Toe Poker session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TicTacToePokerSettings),
  reducer,isTerminal,component:TicTacToePokerGame,
};
