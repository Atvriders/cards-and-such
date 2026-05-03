import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuixoState, QuixoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Quixo } from "./Quixo.js";

export const quixoSettings = {
  botStrength: {
    kind: "enum" as const,
    label: "Bot Strength",
    options: ["easy", "hard"] as const,
    default: "hard",
  },
} as const;

type QuixoSettingsType = SettingsOf<typeof quixoSettings>;

export const quixoPlugin: GamePlugin<QuixoState, QuixoAction, typeof quixoSettings> = {
  id: "quixo",
  title: "Quixo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5×5 row-push game — align five of your marks to win.",
  howToPlay: `Quixo is played on a 5×5 grid of cubes. You are X, the bot is O. All cubes start blank (shown as ·).

On your turn: click any edge cube that is blank or already shows X. The cube is removed from its position and stamped with your mark (X). Then choose a direction (Up, Down, Left, Right) to slide that entire row or column — the cube is re-inserted on the opposite end, pushing everything else one space.

For example, picking the leftmost cube in row 2 and pushing "Right" slides that row: the cube moves to the right end of row 2, and all other cubes shift one step left.

You cannot pick an edge cube showing O — it belongs to the opponent. Inner cubes cannot be selected at all.

Win condition: be the first to get five of your marks in a row — horizontally, vertically, or diagonally. If your push creates five O's as well, the opponent wins.

The hard bot uses two-ply minimax to evaluate board positions. The easy bot plays randomly.

Scoring: win = 100, loss = 0.

Tips: build pressure from multiple directions simultaneously so the bot cannot block all threats. Corners are especially powerful since they appear in row, column, and diagonal lines.`,
  settings: quixoSettings,
  initialState: (seed: number, settings: QuixoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-quixo-action"]', pulses: 3 }; },
  component: Quixo,
};
