import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DotToDotState, DotToDotAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DotToDotGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DotToDotGame as unknown as React.ComponentType<unknown> })));
export const dotToDotSettings = {
  dots: {
    kind: "enum" as const,
    label: "Dots",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
} as const;

type DotToDotSettingsType = SettingsOf<typeof dotToDotSettings>;

export const dotToDotPlugin: GamePlugin<DotToDotState, DotToDotAction, typeof dotToDotSettings> = {
  id: "dot-to-dot",
  title: "Dot to Dot",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect numbered dots in order to reveal a hidden picture. Click each dot in sequence without mistakes.",
  howToPlay: `Dot to Dot is a classic number-sequencing puzzle. Numbered dots are scattered across a canvas. Your goal is to click them in ascending order — dot 1, then dot 2, and so on — to draw connecting lines and complete the picture.

The current target dot is highlighted in gold so you can always see what to click next. Already-connected dots turn blue, and the lines you have drawn appear in light blue.

Clicking the wrong dot counts as a mistake. Mistakes do not stop you — you can keep clicking until you find the correct dot — but each mistake reduces your final score by 10 points.

Score is calculated at the end. The base score is the number of dots multiplied by 20, minus 10 per mistake. A perfect run with no mistakes gives the maximum score.

Choose from 10, 20, or 30 dots. More dots means a larger, more complex picture and a higher potential score. The dot layout is randomly generated each game from a fresh seed, so every game is different.

Tip: scan the board for clusters of consecutive numbers. Smaller numbered gaps are easier to connect quickly, letting you build momentum through the early sequence before the remaining dots spread out.`,
  settings: dotToDotSettings,
  initialState: (seed: number, settings: DotToDotSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dtd-game")) ? { selector: ".dtd-game", pulses: 3 } : null,
  component: DotToDotGame,
};
