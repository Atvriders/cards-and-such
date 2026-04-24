import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RhythmTapState, RhythmTapAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RhythmTap } from "./Game.js";

const rhythmTapSettings = {
  bpm: {
    kind: "enum" as const,
    label: "BPM",
    options: ["60", "90", "120"] as const,
    default: "90" as const,
  },
} as const;

type RhythmTapSettingsType = SettingsOf<typeof rhythmTapSettings>;

export const rhythmTapPlugin: GamePlugin<RhythmTapState, RhythmTapAction, typeof rhythmTapSettings> = {
  id: "rhythm-tap",
  title: "Rhythm Tap",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap the correct lane in time with the beat pattern.",
  howToPlay: `Colored blocks scroll down four lanes from the top of the screen. Your goal is to tap the matching lane button exactly when each block crosses the white hit zone near the bottom.

Press D for the left-red lane, F for left-green, J for right-blue, and K for right-yellow — or tap the on-screen buttons. Timing is judged within a generous window of about 0.18 seconds either side of the beat. Hitting blocks earns 10 points normally, or up to 20 with a combo streak.

Build combos by hitting consecutive beats without a miss. A combo of 5 gives bonus points per hit; a combo of 10 doubles them. Missing a beat breaks your combo and costs a life. You start with five lives.

The song lasts 45 seconds. Surviving the full song completes the stage. Your final score includes a max-combo bonus. BPM controls how fast beats are generated: 60 is relaxed, 90 is moderate, and 120 is intense.

Tips: Watch the lane colors, not individual blocks. Keep your hands on the home keys D, F, J, K throughout. Anticipate bursts where two beats land close together — stay calm and tap each one in order.`,
  settings: rhythmTapSettings,
  initialState: (seed: number, settings: RhythmTapSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RhythmTap,
};
