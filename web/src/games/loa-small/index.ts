import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LoaSmallState, LoaSmallAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LoaSmallGame } from "./Game.js";

const settings = {} as const;

export const loaSmallPlugin: GamePlugin<LoaSmallState, LoaSmallAction, typeof settings> = {
  id: "loa-small",
  title: "Lines of Action (6×6)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact 6×6 Lines of Action — connect all your pieces to win.",
  howToPlay: `Lines of Action (6×6) is a compact version of the classic abstract strategy game invented by Claude Soucie. You play dark pieces starting on the left and right columns (A and F, rows 2–5); the bot plays light pieces on the top and bottom rows (rows 1 and 6, columns B–E).

The movement rule is elegant and distinctive: a piece moves exactly N squares in any of the eight directions (orthogonal or diagonal), where N equals the total number of pieces — both yours and the opponent's — that lie on that piece's line (the entire row, column, or diagonal through it).

Path rules: your piece may pass over your own pieces but cannot land on them. It may pass over opponent pieces and can land on one, capturing it by displacement.

Goal: be the first player to connect ALL of your remaining pieces into a single group (pieces are connected if they are orthogonally or diagonally adjacent). Note: if your last piece gets captured, you lose — so capturing all of an opponent's pieces also wins.

Strategy: LOA rewards spatial thinking. Move pieces toward the center to concentrate them. The N-step rule means lines with many pieces produce short moves, and lines with few pieces produce longer moves. Plan ahead — reducing your N makes moves more predictable.

Bot: minimax at depth 2, minimizing your number of connected groups.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: LoaSmallGame,
};
