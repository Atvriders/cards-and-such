import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuixoMiniState, QuixoMiniAction, QuixoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuixoMiniGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const quixoMiniPlugin: GamePlugin<QuixoMiniState, QuixoMiniAction, typeof settings> = {
  id: "quixo-mini",
  title: "Quixo (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real Quixo on a 4×4 board. Pick an edge cube, push the row/column. Four in a row wins.",
  howToPlay: `Quixo Mini compresses the cube-pushing classic to a 4×4 board. On your turn:

1) Pick a cube on the edge of the board that is either blank or already shows your mark (X). Selected cubes are highlighted.
2) Choose a direction to push: Up, Down, Left, or Right. The selected cube re-enters the board on the opposite side as your mark, sliding the rest of the row/column down by one. The cube on the far end falls off the board.

You can never select a cube already showing the opponent's mark. The first player to line up four of their mark in any row, column, or diagonal wins.

Easy bot picks legal moves at random; Hard bot scores resulting positions and avoids handing you an immediate win.

Scoring: win = 100, loss = 0.

Tips: pushing your own mark across the diagonal is powerful — you can extend without giving the opponent edges to work with. Watch out for self-defeats: if your push completes both your line and the opponent's, the rules treat the latest active player's mark as the winner.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuixoMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".quixo-dir-btn", pulses: 3 }; },
  component: QuixoMiniGame,
};
