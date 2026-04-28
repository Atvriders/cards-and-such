import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxGemixxtState, QwixxGemixxtAction, QwixxGemixxtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxGemixxtGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const qwixxGemixxtPlugin: GamePlugin<QwixxGemixxtState, QwixxGemixxtAction, typeof settings> = {
  id: "qwixx-gemixxt",
  title: "Qwixx Gemixxt",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Qwixx variant with mixed cell-by-cell rules across 4 colored chunks.",
  howToPlay: `Qwixx Gemixxt mixes the rows so each row has cells of multiple colors. In this adaptation you have a 4x4 grid (16 cells), each pre-painted with one of 4 colors: red, yellow, green, blue.

Each turn you roll 2 dice. Sum is your eligible value (2-12). Click any unmarked cell to mark it; you score points based on the cell's color and your roll's value.

Scoring:
• Red cell marked with sum 2-6: +1 each
• Red cell marked with sum 7-12: +3 each
• Yellow cell marked with sum 6-8: +5 each
• Yellow cell marked with other sums: +1 each
• Green cell marked with sum 9-12: +4 each
• Green cell marked with sum 2-8: +2 each
• Blue cell marked: +2 each (color-blind mark, always safe)
• Bonus +10 for marking 3+ same-color cells

Match your dice sum to colored cells for max score. A well-played Qwixx Gemixxt scores 25-40 points. Pass if no good match is available — the game ends after 14 rolls regardless.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QwixxGemixxtSettings),
  reducer,
  isTerminal,
  component: QwixxGemixxtGame,
};
