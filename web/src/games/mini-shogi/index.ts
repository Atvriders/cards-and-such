import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MiniShogiState, MiniShogiAction, MiniShogiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniShogi } from "./Game.js";

const settings = {} as const;

export const miniShogiPlugin: GamePlugin<MiniShogiState, MiniShogiAction, typeof settings> = {
  id: "mini-shogi",
  title: "Mini Shogi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Minishogi — compact 5×5 Japanese chess with drops and promotions.",
  howToPlay: `Mini Shogi (Minishogi) is a compact version of Shogi played on a 5×5 board. You play Sente (bottom, pieces moving upward); the bot plays Gote (top, pieces moving downward). Capture the enemy King to win.

Each player starts with six pieces: King (王 moves one step any direction), Gold General (金 moves one step orthogonally or diagonally forward), Silver General (銀 moves diagonally or straight forward), Bishop (角 slides diagonally), Rook (飛 slides orthogonally), and Pawn (歩 moves one step forward).

Promotion: when a piece moves into or out of the last rank (the opponent's home row), it may promote. Promoted Rook (龍) also steps diagonally. Promoted Bishop (馬) also steps orthogonally. Promoted Silver and Pawn move like a Gold.

Drops: captured pieces go into your hand and can be dropped onto any empty square on a future turn instead of moving. Pawns cannot be dropped on the last rank.

Click a piece on the board to select it, then click a highlighted square to move. Click a piece in your hand to prepare a drop, then click any empty square. The bot plays at depth 2.`,
  settings,
  initialState: (seed: number, s: MiniShogiSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".minishogi-board")) ? { selector: ".minishogi-board", pulses: 3 } : null,
  component: MiniShogi,
};
