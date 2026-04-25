import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarbleRollState, MarbleRollAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarbleRoll } from "./MarbleRoll.js";

export const marbleRollSettings = {} as const;

type MRSettingsType = SettingsOf<typeof marbleRollSettings>;

export const marbleRollPlugin: GamePlugin<MarbleRollState, MarbleRollAction, typeof marbleRollSettings> = {
  id: "marble-roll",
  title: "Marble Roll",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tilt the board and guide the marble into the hole before time runs out!",
  howToPlay: `Marble Roll is a tilt-control precision game across six rounds. A marble rests on a wooden board and you must guide it into the dark hole before the timer expires.

Use the Left and Right buttons or the arrow keys to tilt the board. Tilting left pushes the marble toward the left side, and tilting right pushes it toward the right. Gravity naturally rolls the marble downward, so combined horizontal and vertical forces will steer the marble toward the hole.

The marble obeys physics — it has momentum, which means it builds speed over time and doesn't stop instantly. Short taps give you fine control, while holding a direction for too long will send the marble careening off a wall. Walls are bouncy, so a well-timed bounce can actually help redirect the marble toward the goal.

Scoring rewards both accuracy and speed. Landing the marble directly in the center of the hole earns the highest accuracy bonus (up to 50 points), plus a time bonus based on how quickly you sank it. Maximum score for a perfect fast sink is around 130 points per round.

Tips: Don't over-tilt — short bursts of input work better than holding a direction. Watch the marble's speed and anticipate where it will be in half a second. The hole is larger than it looks, so aim for the general vicinity and let the marble roll in naturally.`,
  settings: marbleRollSettings,
  initialState: (seed: number, _settings: MRSettingsType) => initialState(seed),
  reducer,
  isTerminal,
  component: MarbleRoll,
};
