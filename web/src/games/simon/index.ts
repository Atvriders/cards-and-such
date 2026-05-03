import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SimonState, SimonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Simon = /* @__PURE__ */ lazy(() => import("./Simon.js").then((mod) => ({ default: mod.Simon as unknown as React.ComponentType<unknown> })));
export const simonSettings = {} as const;

export const simonPlugin: GamePlugin<SimonState, SimonAction, typeof simonSettings> = {
  id: "simon",
  title: "Simon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the pattern, then repeat it. Each round the sequence grows by one.",
  howToPlay: `Simon is a classic memory game with four colored buttons. Each round, the game adds one new color to the sequence and plays the full sequence back to you by flashing the colors in order. Then it's your turn to repeat the exact same sequence by clicking the colored buttons.

Press Start to begin. The game will flash the sequence — watch carefully! Once the flashing stops, it's your turn. Click the buttons in the same order the game showed you. If you get them all right, you advance to the next round, which adds one more color to the sequence.

If you click the wrong color at any point, the game ends and your score equals the number of rounds you successfully completed.

The colors are red, green, blue, and yellow. Each new color added to the sequence is chosen by the seeded random number generator so that every game with the same seed plays the same sequence. The sequence can grow indefinitely — how far can you go?

Tips: Rather than memorizing individual colors, try to group them in chunks of 3 or 4 and remember the rhythm as a pattern. Some players associate colors with musical notes. For longer sequences, silently repeat the sequence in your head as you watch it flash. Avoid distractions and keep your eyes on the board during the show phase.`,
  settings: simonSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SimonState): HintTarget | null => {
    if (state.phase === "idle" || state.phase === "complete" || state.phase === "failed") {
      return { selector: `[data-testid="hint-target-simon-start"]`, pulses: 3 };
    }
    if (state.phase !== "input") return null;
    const expected = state.sequence[state.playerIndex];
    if (!expected) return null;
    return { selector: `[data-testid="hint-target-simon-${expected}"]`, pulses: 3 };
  },
  component: Simon,
};
