import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToeCardsState, TicTacToeCardsAction, TicTacToeCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TicTacToeCards } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ticTacToeCardsPlugin: GamePlugin<TicTacToeCardsState, TicTacToeCardsAction, typeof settings> = {
  id: "tic-tac-toe-cards",
  title: "Tic-Tac-Toe Cards",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-themed Tic-Tac-Toe. You play red (Hearts/Diamonds), CPU plays black (Spades/Clubs).",
  howToPlay: "Tic-Tac-Toe Cards is a playing-card themed twist on classic Tic-Tac-Toe. The 3x3 board fills with face-up cards rather than X/O symbols.\n\nClick any empty cell to place your piece — a randomly drawn red card (Hearts or Diamonds). The CPU answers with a randomly drawn black card (Spades or Clubs). The first side to align three same-color cards in a row, column, or diagonal wins.\n\nThe CPU runs basic AI: it takes any winning move, blocks your imminent wins, prefers the center, and otherwise plays randomly. A win scores 100 points plus a bonus equal to the rank-sum of your winning line, plus a small per-piece bonus. A draw is 25 points; a loss is zero.\n\nThe card art adds visual flavor without affecting line-detection logic — only color (suit-color) matters for the win, exactly like X/O. Try to set up double threats so the CPU can only block one.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TicTacToeCardsSettings),
  reducer,
  isTerminal,
  component: TicTacToeCards,
};
