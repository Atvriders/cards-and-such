import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BreakthroughState, BreakthroughAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Breakthrough = /* @__PURE__ */ lazy(() => import("./Breakthrough.js").then((mod) => ({ default: mod.Breakthrough as unknown as React.ComponentType<unknown> })));
export const breakthroughSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type BreakthroughSettingsType = SettingsOf<typeof breakthroughSettings>;

export const breakthroughPlugin: GamePlugin<BreakthroughState, BreakthroughAction, typeof breakthroughSettings> = {
  id: "breakthrough",
  title: "Breakthrough",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Race your pieces to the opposite back row before the bot does.",
  howToPlay: `Breakthrough is a fast two-player race game played on an 8×8 board. Each player starts with 16 pieces filling the two nearest rows — White (you) on rows 6–7, Black (bot) on rows 0–1.

On your turn, move one of your pieces in one of three forward directions: straight ahead or diagonally forward. A piece moving straight forward may not land on an occupied square. A piece moving diagonally forward captures the opponent's piece if one sits on the target square — your piece replaces it. You may never move backward.

Win by being the first to land any of your pieces on the opponent's back row (row 0 for White), or by capturing every one of the opponent's pieces.

The bot plays Black and searches three moves ahead, favouring pieces that have advanced furthest down the board. To beat the bot, push several pawns simultaneously so it cannot block them all.

Click a white piece to select it (highlighted in gold), then click a green-tinted target square to complete the move. Hot-seat mode lets two humans alternate.`,
  settings: breakthroughSettings,
  initialState: (seed: number, settings: BreakthroughSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".breakthrough-grid")) ? { selector: ".breakthrough-grid", pulses: 3 } : null,
  component: Breakthrough,
};
