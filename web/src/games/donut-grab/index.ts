import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DonutGrabState, DonutGrabAction, DonutGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DonutGrab } from "./Game.js";

const donutGrabPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof donutGrabPluginSettings>;

export const donutGrabPlugin: GamePlugin<DonutGrabState, DonutGrabAction, typeof donutGrabPluginSettings> = {
  id: "donut-grab",
  title: "Donut Grab",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Donuts are falling from the bakery shelf! Grab them before they hit the floor — don't let any go to waste!",
  howToPlay: `Donut Grab is a delicious catching arcade game. Fresh donuts tumble from the top of the screen at random positions. Click each donut to catch it before it hits the ground!

A single donut earns 10 points. A double donut (two stacked) falls faster and is worth 20 points — prioritize those for maximum points! Every donut that lands uncaught costs one life.

You start with 3 lives. Lose all three and the game ends. The timer also ends the game when it runs out.

New donuts drop every two seconds. Up to 6 can be falling at once so stay alert!

Use Settings to choose 20, 30, or 45 seconds. Final score, catch count, and miss count are shown at the end. Can you grab every donut and keep all 3 lives?`,
  settings: donutGrabPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as DonutGrabSettings),
  reducer, isTerminal, component: DonutGrab,
};
