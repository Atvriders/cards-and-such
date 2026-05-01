import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReversiRandomStartState, ReversiRandomStartAction, ReversiRandomStartSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReversiRandomStartGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const reversiRandomStartPlugin: GamePlugin<ReversiRandomStartState, ReversiRandomStartAction, typeof settings> = {
  id: "reversi-random-start",
  title: "Reversi (Random Start)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reversi played from a random 4-disc opening (2 black, 2 white). Memorised lines won't help you here.",
  howToPlay: `Standard Reversi (Othello) on an 8×8 board, but every game starts from a random configuration of two black and two white discs scattered through the central 4×4 area. The standard cross-pattern opening is gone — you'll have to read the board fresh every game.

Place a disc on a highlighted square so that one or more of your opponent's discs are sandwiched in a straight line by your disc and one of your existing discs. All sandwiched discs flip to your colour. If you can't make a legal move, click Pass.

The game ends when neither player can move or the board is full. Most discs of your colour wins.

Scoring: win = 100 + (your discs − opponent discs) × 5; draw = 50; loss = max(0, your discs − 10).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ReversiRandomStartSettings),
  reducer,
  isTerminal,
  component: ReversiRandomStartGame,
};
