import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ColorSequenceState, ColorSequenceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorSequence = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorSequence as unknown as React.ComponentType<unknown> })));
export const colorSequenceSettings = {} as const;

export const colorSequencePlugin: GamePlugin<ColorSequenceState, ColorSequenceAction, typeof colorSequenceSettings> = {
  id: "color-sequence",
  title: "Color Sequence",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simon-style memory with 5 colors. Watch the growing sequence and repeat it!",
  howToPlay: `Color Sequence is an expanded memory challenge similar to Simon, but played with five colors instead of four: red, green, blue, yellow, and purple. Each round, the game extends the sequence by one new color and plays the full sequence back to you by flashing each colored button in order.

Press Start to begin. Watch the colors carefully as they flash — the sequence begins with a single color and grows by one each round. When the flashing stops, it is your turn. Click the colored buttons in exactly the same order the game showed you. You must not click any button while the game is showing the sequence.

If you tap the correct colors in the right order, you advance to the next round. One mistake ends the game, and your score equals the number of rounds you successfully completed.

The fifth color (purple) adds 25% more combinations compared to classic four-color Simon, making longer sequences significantly harder to memorize. Try to hear the rhythm of the sequence rather than thinking of each color independently. Grouping the colors into short "melodies" — for example, red-blue as a pair, then yellow — helps your brain hold longer chains. How many rounds can you survive?`,
  settings: colorSequenceSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: ColorSequenceState) => {
    if (state.phase === "complete") return null;
    return { selector: ".cs-start-btn", pulses: 3 };
  },
  component: ColorSequence,
};
