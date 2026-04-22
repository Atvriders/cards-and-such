import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuartoState, QuartoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Quarto } from "./Quarto.js";

export const quartoSettings = {
  botStrength: {
    kind: "enum" as const,
    label: "Bot Strength",
    options: ["easy", "hard"] as const,
    default: "hard",
  },
} as const;

type QuartoSettingsType = SettingsOf<typeof quartoSettings>;

export const quartoPlugin: GamePlugin<QuartoState, QuartoAction, typeof quartoSettings> = {
  id: "quarto",
  title: "Quarto",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "16 unique pieces, 4 binary traits — and your opponent picks your piece.",
  howToPlay: `Quarto is a deceptively deep strategy game on a 4×4 board. There are 16 unique pieces, each with four binary attributes: Tall or Short, Light or Dark shade, Square or Round, Solid or Hollow.

The key twist: your opponent chooses which piece you must place. Then you choose a piece for them. Win by placing a piece that completes a row, column, or diagonal of four pieces all sharing at least one attribute (e.g., four tall pieces, or four hollow pieces — any single attribute counts).

Each turn alternates between two phases: Place — put the piece chosen for you anywhere on the empty board. Choose — pick a piece from those remaining for the bot to place next.

The bot first tries to place pieces to win immediately. If no winning move exists, it looks for cells that minimise the opponent's winning chances. When choosing a piece, it tries to avoid giving you a piece that could complete a line.

Pieces are shown with icons: ■/□ = Square solid/hollow, ●/○ = Round solid/hollow. Size and shade are shown as Tall/Short and Lt/Dk.

Scoring: win = 100, draw = 50, loss = 0.

Tip: Beware of handing the opponent a piece that could complete multiple line types — they will find the best cell for it.`,
  settings: quartoSettings,
  initialState: (seed: number, settings: QuartoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Quarto,
};
