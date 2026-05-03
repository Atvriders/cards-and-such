import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DotsCaptureState, DotsCaptureAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DotsCapture = /* @__PURE__ */ lazy(() => import("./DotsCapture.js").then((mod) => ({ default: mod.DotsCapture as unknown as React.ComponentType<unknown> })));
export const dotsCaptureSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type DotsCaptureSettingsType = SettingsOf<typeof dotsCaptureSettings>;

export const dotsCapturePlugin: GamePlugin<DotsCaptureState, DotsCaptureAction, typeof dotsCaptureSettings> = {
  id: "dots-capture",
  title: "Dots Capture",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Place dots on a 7×7 grid. Surround opponent dots to capture them. Most points after 20 turns wins.",
  howToPlay: `Dots Capture is a quick territory game played on a 7×7 grid. You play as White; the bot plays as Black. The game lasts exactly 20 turns total (10 per player).

On each turn, place one dot of your colour on any empty cell. After all 20 turns, the board is scored.

Scoring: a dot is "captured" if all four of its orthogonal neighbours are either occupied by the opponent or off the edge of the board. Final score equals your total dots, minus your dots that were captured, plus the opponent's dots that you captured. The higher score wins.

Strategy: cluster your dots together so they protect each other — a dot with at least one friendly neighbour cannot be captured from that side. Try to isolate small groups of opponent dots and fill in around them. Corner and edge cells are easier to surround because fewer neighbours need to be filled.

The bot searches three turns ahead, evaluating the balance of captured dots. Faded dots on the board are currently surrounded (captured). The score is shown when the game ends.`,
  settings: dotsCaptureSettings,
  initialState: (seed: number, settings: DotsCaptureSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dots-grid")) ? { selector: ".dots-grid", pulses: 3 } : null,
  component: DotsCapture,
};
