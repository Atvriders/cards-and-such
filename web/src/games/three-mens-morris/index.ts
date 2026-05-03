import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, ThreeMorrisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeMensMorrisGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const threeMensMorrisPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "three-mens-morris",
  title: "Three Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real Three Men's Morris on a 3×3 grid plus diagonals. Place 3 men, then slide. First 3-in-a-row wins.",
  howToPlay: `Three Men's Morris is the smallest and oldest Morris variant. Each player has 3 men. The board is a 3×3 grid with adjacencies along rows, columns, and the two long diagonals (the centre connects to all 8 surrounding points).

Phase 1 — Placing: each player places all 3 men on empty intersections, one per turn. If you complete 3-in-a-row while placing, you win immediately.

Phase 2 — Moving: once both have placed all 3 men, you slide one of your men to an empty adjacent intersection per turn. The first to align 3 in a row (horizontal, vertical, or diagonal) wins. If a player has no legal moves, they lose.

Click-to-act: in placing phase click any empty intersection; in moving phase click your piece to select, then click an adjacent empty target.

Scoring: win = 100, loss = 0.

Tips: the centre is golden — it lies on 4 of the 8 winning lines and connects to all other points. Avoid letting the bot reach the centre.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeMorrisSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mm3-board")) ? { selector: ".mm3-board", pulses: 3 } : null,
  component: ThreeMensMorrisGame,
};
