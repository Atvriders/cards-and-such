import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AppleTossState, AppleTossAction, AppleTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AppleToss } from "./Game.js";

const appleTossSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof appleTossSettings>;

export const appleTossPlugin: GamePlugin<AppleTossState, AppleTossAction, typeof appleTossSettings> = {
  id: "apple-toss",
  title: "Apple Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Apples are falling from the sky! Click them before they hit the ground. Miss three and the harvest is ruined!",
  howToPlay: `Apple Toss is a fast-paced catching arcade game. Apples fall from the top of the screen at random horizontal positions and varying speeds. Click each apple before it reaches the ground to catch it and earn points.

A standard apple earns 10 points. Double apples (faster-falling) are worth 20 points each — prioritize those for maximum score! Every apple that hits the ground costs you one life.

You start with 3 lives. Lose all three lives and the game ends. The timer also ends the game when it runs out — whichever comes first.

New apples spawn every two seconds. Up to 6 apples can be visible at once, so scan quickly and click fast!

Use Settings to choose 20, 30, or 45 seconds. Final score, catch count, and miss count are shown at the end. Can you keep all 3 lives and catch every apple?`,
  settings: appleTossSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as AppleTossSettings),
  reducer, isTerminal, component: AppleToss,
};
