import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GemGrabState, GemGrabAction, GemGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GemGrab } from "./Game.js";

const gemGrabPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof gemGrabPluginSettings>;

export const gemGrabPlugin: GamePlugin<GemGrabState, GemGrabAction, typeof gemGrabPluginSettings> = {
  id: "gem-grab",
  title: "Gem Grab",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Precious gems are falling from the mine above! Grab them before they shatter on the floor — every gem counts!",
  howToPlay: `Gem Grab is a sparkling arcade collecting game. Gems tumble from the ceiling at random positions. Click each gem to collect it before it shatters on the floor!

A standard gem earns 10 points. A double gem (rarer and faster) is worth 20 points — those are most valuable so prioritize grabbing them! Every gem that hits the floor costs one life.

You start with 3 lives. Lose all three and the game ends. The timer also ends the game when it runs out.

New gems appear every two seconds. Up to 6 can be falling at once. Keep your eyes on the arena!

Use Settings to choose 20, 30, or 45 seconds. Final score, gems collected, and gems lost are shown at the end. Can you fill your vault with every last gem?`,
  settings: gemGrabPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as GemGrabSettings),
  reducer, isTerminal, component: GemGrab,
};
