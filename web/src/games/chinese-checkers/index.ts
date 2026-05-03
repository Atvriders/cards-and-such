import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CCState, CCAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChineseCheckers = /* @__PURE__ */ lazy(() => import("./ChineseCheckers.js").then((mod) => ({ default: mod.ChineseCheckers as unknown as React.ComponentType<unknown> })));
export const chineseCheckersSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type CCSettingsType = SettingsOf<typeof chineseCheckersSettings>;

export const chineseCheckersPlugin: GamePlugin<CCState, CCAction, typeof chineseCheckersSettings> = {
  id: "chinese-checkers",
  title: "Chinese Checkers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race your 10 pegs across the 6-pointed star board to the opposite corner before your opponent.",
  howToPlay: `Chinese Checkers is a race game for 2–6 players played on a 6-pointed star board. In this two-player version, you control Red (top point) and compete against Blue (bottom point). Your goal: move all 10 of your pegs to the opposite point of the star before the bot does the same.

On your turn, you may move one peg. There are two types of moves: a step moves your peg to any empty adjacent cell (there are up to six neighbors in the hex grid). A jump leaps over any adjacent peg — yours or the bot's — landing on the empty cell directly beyond it. After a jump, you may continue jumping with the same peg as many times as you like in a single turn, forming a chain.

You cannot step and jump in the same turn — it's one or the other. Chain jumps can cover a lot of ground quickly, so building "bridges" of pegs for your pieces to hop across is a key strategy.

Click a Red peg to select it (it will glow yellow), then click a highlighted destination to move. Yellow dots show valid landing squares. The bot uses a greedy strategy, always advancing the peg that makes the most progress toward its goal.

Tip: try to set up long jump chains early in the game. Don't block your own pegs in the home corner.`,
  settings: chineseCheckersSettings,
  initialState: (seed: number, settings: CCSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".cc-board")) ? { selector: ".cc-board", pulses: 3 } : null,
  component: ChineseCheckers,
};
