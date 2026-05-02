import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AxeThrowState, AxeThrowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AxeThrow } from "./AxeThrow.js";

export const axeThrowSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7" as const,
  },
} as const;

type AxeThrowSettingsType = SettingsOf<typeof axeThrowSettings>;

export const axeThrowPlugin: GamePlugin<AxeThrowState, AxeThrowAction, typeof axeThrowSettings> = {
  id: "axe-throw",
  title: "Axe Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time your release as the aim bar swings. The axe spins in flight — stick the blade into the log!",
  howToPlay: `Face the wooden log target and get ready to throw. An aim bar swings left and right constantly, simulating the natural sway of your throwing arm. When the bar is in the green zone (far right), your trajectory will sail true toward the bullseye. Throwing from the middle or left sends the axe high or low.

Press THROW when the bar is positioned where you want. The axe launches and spins through the air, rotating continuously. To stick, the blade must arrive at the log face-on — if the handle hits or the axe is upside down, it bounces off harmlessly for zero points.

Scoring depends on where the blade buries into the wood: a dead-centre bullseye hit scores up to 100 points; hits near the edge of the log score around 20. A miss or bounce scores 0.

The swing speed changes each round, so you cannot simply memorize a timing. Adapt to each round's pace, wait patiently for the bar to reach the green, and commit to the throw without hesitation. Five, seven, or ten rounds are available — go for maximum stickage!`,
  settings: axeThrowSettings,
  initialState: (seed: number, settings: AxeThrowSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: AxeThrowState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-axe-throw-action"]', pulses: 3 };
    },
  component: AxeThrow,
};
