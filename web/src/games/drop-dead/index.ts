import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DropDeadState, DropDeadAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DropDead = /* @__PURE__ */ lazy(() => import("./DropDead.js").then((mod) => ({ default: mod.DropDead as unknown as React.ComponentType<unknown> })));
const dropDeadSettings = {
  dice: {
    kind: "enum" as const,
    label: "Starting dice",
    options: ["5", "7"] as const,
    default: "5" as const,
  },
} as const;

type DropDeadSettingsType = SettingsOf<typeof dropDeadSettings>;

export const dropDeadPlugin: GamePlugin<DropDeadState, DropDeadAction, typeof dropDeadSettings> = {
  id: "drop-dead",
  title: "Drop Dead",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice and score the sum — unless a 2 or 5 appears. Those dice are dead and removed.",
  howToPlay: `Drop Dead is a classic push-your-luck dice game played with five (or seven) dice. On each roll, any die showing a 2 or a 5 is immediately "dead" and removed from play — but you score nothing that round. Only when no dead dice appear do you add the sum of all remaining dice to your score.

Play continues turn after turn, rolling the surviving dice, removing any 2s and 5s, and scoring the others. The game ends automatically when all dice have been eliminated. Your final score is the total accumulated over all scoring rolls.

Dead dice (2 and 5) are highlighted in red after each roll. Live dice (everything else) are shown in green. You can see how many dice remain active at all times.

Strategy is minimal — there are no choices to make — but the tension builds as dice drop out one by one. A perfect game with five dice requires many rolls where no 2s or 5s appear.

Try the 7-dice variant for a longer, higher-scoring game. Average score with 5 dice is around 80–100.`,
  settings: dropDeadSettings,
  initialState: (seed: number, settings: DropDeadSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-drop-dead-roll"]', pulses: 3 };
  },
  component: DropDead,
};
