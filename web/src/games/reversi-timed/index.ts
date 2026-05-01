import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReversiTimedState, ReversiTimedAction, ReversiTimedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReversiTimedGame } from "./Game.js";

const settings = {
  clockSeconds: { kind: "enum" as const, label: "Move clock", options: ["10", "15", "30"] as const, default: "15" as const },
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const reversiTimedPlugin: GamePlugin<ReversiTimedState, ReversiTimedAction, typeof settings> = {
  id: "reversi-timed",
  title: "Reversi (Timed)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reversi with a per-move shot clock. Run out and a random legal move is played for you.",
  howToPlay: `Standard Reversi (Othello) on an 8×8 board with a per-move shot clock for you. You play Black (●), the bot plays White (○).

Place a disc on a highlighted square so that one or more of your opponent's discs are sandwiched in a straight line (horizontal, vertical, or diagonal) by your disc and one of your existing discs. All sandwiched discs flip to your colour. If you can't make a legal move, click Pass.

The clock counts down each second while it's your turn. If the clock hits 0, a random legal move is played for you (or you auto-pass). The clock resets each turn.

The game ends when neither player can move or the board is full. Most discs of your colour wins.

Scoring: win = 100 + (your discs − opponent discs) × 5, draw = 50, loss = max(0, your discs − 10).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ReversiTimedSettings),
  reducer,
  isTerminal,
  component: ReversiTimedGame,
};
