import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveFieldKonoState, FiveFieldKonoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveFieldKono } from "./Game.js";

export const fiveFieldKonoSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type FiveFieldKonoSettingsType = SettingsOf<typeof fiveFieldKonoSettings>;

export const fiveFieldKonoPlugin: GamePlugin<FiveFieldKonoState, FiveFieldKonoAction, typeof fiveFieldKonoSettings> = {
  id: "five-field-kono",
  title: "Five Field Kono",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean diagonal capture game on a 5×5 board.",
  howToPlay: `Five Field Kono is a traditional Korean board game played on a 5×5 grid. Each player starts with ten pieces filling the two rows nearest their home edge. You play White (bottom rows); the bot plays Black (top rows).

All movement is diagonal — one square in any of the four diagonal directions. A piece may move to an adjacent empty diagonal square (non-capturing) or land on an opponent's piece to capture it (replacing it). If a capture is available, it is mandatory — you must take it. There is no chain-capturing; each move is a single step.

The game ends when all pieces of one side are captured. Click a white piece to select it; highlighted squares show legal destinations. Red highlights indicate capture moves.

Strategy: try to maintain piece clusters so that your pieces protect each other diagonally. The mandatory-capture rule can be exploited — lure the opponent's pieces into positions where they are forced to walk into your attack. Because the bot plays randomly, aggressive forward pressure usually wins.

Scoring: win = 20; loss = 0.`,
  settings: fiveFieldKonoSettings,
  initialState: (seed: number, settings: FiveFieldKonoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".fivefieldkono-board")) ? { selector: ".fivefieldkono-board", pulses: 3 } : null,
  component: FiveFieldKono,
};
