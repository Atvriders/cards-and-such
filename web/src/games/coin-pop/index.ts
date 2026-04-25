import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoinPopState, CoinPopAction, CoinPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoinPop } from "./Game.js";

const coinPopPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof coinPopPluginSettings>;

export const coinPopPlugin: GamePlugin<CoinPopState, CoinPopAction, typeof coinPopPluginSettings> = {
  id: "coin-pop",
  title: "Coin Pop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Coins are bouncing down! Click each coin to collect it before it bounces away — stack up that gold!",
  howToPlay: `Coin Pop is a collecting arcade game. Gold coins drop from the top of the screen at random positions. Click each coin to collect it before it hits the floor and rolls away!

A single coin earns 10 points. A money bag (bigger and rarer) falls faster and is worth 20 points — snap those up! Every coin that escapes costs one life.

You start with 3 lives. Lose all three and the game ends. The countdown timer also ends the game when it runs out.

New coins pop in every two seconds. Up to 6 can be falling at once. Keep scanning and clicking!

Use Settings to choose 20, 30, or 45 seconds. Final score, collection count, and misses are shown at the end. Can you collect every coin for a perfect sweep?`,
  settings: coinPopPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoinPopSettings),
  reducer, isTerminal, component: CoinPop,
};
