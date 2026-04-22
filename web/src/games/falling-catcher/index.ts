import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FallingCatcherState, FallingCatcherAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FallingCatcher } from "./FallingCatcher.js";

export const fallingCatcherSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type FallingCatcherSettingsType = SettingsOf<typeof fallingCatcherSettings>;

export const fallingCatcherPlugin: GamePlugin<FallingCatcherState, FallingCatcherAction, typeof fallingCatcherSettings> = {
  id: "falling-catcher",
  title: "Falling Catcher",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move the basket to catch coins and stars while avoiding bombs. 60-second session.",
  howToPlay: `Items fall from the top of the screen. Move the basket left and right to catch them before they hit the ground. Coins are worth 1 point and stars are worth 3 points. Bombs cost you a life if you catch them — but they deal no penalty if they fall through.

Move the basket by moving your mouse over the arena, or use the left and right arrow keys for keyboard control. You start with 3 lives. Catching a bomb costs 1 life. When all three lives are gone the game ends early, so dodging bombs is critical on harder difficulties.

The game runs for 60 seconds. On easy, items fall slowly and bombs are rare. On medium the pace picks up and more bombs appear. On hard, items rain down quickly with frequent bombs interspersed, demanding constant attention and quick lateral movement.

Tips: Position the basket under stars before coins since stars score triple. Watch for incoming bombs early — they look like round black grenades — and drift away from them before they get close rather than making a last-second dodge. On hard mode it's often better to miss a coin than to risk catching a nearby bomb. Keep the basket near the center of the screen to give yourself the most reaction time for items on either edge.`,
  settings: fallingCatcherSettings,
  initialState: (seed: number, settings: FallingCatcherSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FallingCatcher,
};
