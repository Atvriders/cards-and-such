import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EggDropState, EggDropAction, EggDropSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EggDrop } from "./Game.js";

const eggDropPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof eggDropPluginSettings>;

export const eggDropPlugin: GamePlugin<EggDropState, EggDropAction, typeof eggDropPluginSettings> = {
  id: "egg-drop",
  title: "Egg Drop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eggs are dropping from the nest above! Click them to catch them before they crack on the ground!",
  howToPlay: `Egg Drop is a careful catching arcade game. Eggs tumble from a nest at the top of the screen. Click each egg to catch it in your basket before it smashes on the ground!

A standard egg earns 10 points. Double eggs (falling in pairs) fall faster and are worth 20 points — catch those for a score bonus! Every egg that hits the ground costs one life.

You start with 3 lives. Lose all three and the game is over. The countdown timer also ends the game.

New eggs drop every two seconds. Up to 6 can be falling at once, so keep scanning and tapping quickly!

Use Settings to choose 20, 30, or 45 seconds. Final score, eggs caught, and eggs broken are shown at the end. Can you keep every egg safe?`,
  settings: eggDropPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as EggDropSettings),
  reducer, isTerminal, component: EggDrop,
};
