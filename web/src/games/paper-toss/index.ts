import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { PaperTossState, PaperTossAction, PaperTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PaperTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PaperTossGame as unknown as React.ComponentType<unknown> })));
export const paperTossSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const paperTossPlugin: GamePlugin<PaperTossState, PaperTossAction, typeof paperTossSettings> = {
  id: "paper-toss",
  title: "Paper Toss",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toss a paper ball into the trash by setting angle and power — watch out for wind!",
  howToPlay: `Paper Toss is an arcade-style throwing game. Your goal is to toss a paper ball into a trash can across 10 throws. Each throw is affected by a different wind condition, so you must adjust your aim every time.

Before each throw you set two parameters using sliders:
- Angle (30°–150°): The direction of your throw. 90° is straight up toward the basket. Angles below 90° aim left, above 90° aim right.
- Power (1–100): How hard you throw. The ideal power is around 60 — too little and you fall short, too much and you overshoot.

After setting both sliders, click Throw to send the paper ball flying. The wind reading shown in the play area indicates how much drift the ball will experience. Calm wind means your sliders are the only factors; strong wind requires compensation.

Scoring per throw: a hit scores up to 10 points depending on how close to center the ball lands. A miss scores nothing.

Experiment with different angle and power combinations to find what works for each wind condition. The wind changes randomly between throws, so stay alert. Max possible score is 100 — good luck!`,
  settings: paperTossSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: PaperTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-paper-toss-action"]', pulses: 3 };
    },
  component: PaperTossGame,
};
