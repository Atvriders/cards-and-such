import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VideoKenoState, VideoKenoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VideoKenoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.VideoKenoGame as unknown as React.ComponentType<unknown> })));
export const videoKenoSettings = {
  pickCount: {
    kind: "enum" as const,
    label: "Numbers to Pick",
    options: ["2", "3", "4", "5", "6", "7", "8", "9", "10"] as const,
    default: "6",
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Round",
    options: ["1", "2", "5", "10"] as const,
    default: "2",
  },
  roundsPerSession: {
    kind: "number" as const,
    label: "Rounds per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
} as const;

type Settings = SettingsOf<typeof videoKenoSettings>;

export const videoKenoPlugin: GamePlugin<VideoKenoState, VideoKenoAction, typeof videoKenoSettings> = {
  id: "video-keno",
  title: "Video Keno",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick 2–10 numbers from 1–80. 20 numbers drawn. Win based on how many you match.",
  howToPlay: `Video Keno is a casino lottery-style game played on a grid of 80 numbers. Each round you select between 2 and 10 spots (numbers), then 20 numbers are drawn at random. Your payout depends on how many of your picks match the draw.

How to play: First choose how many spots to play (the Pick Count setting). Click that many numbers on the 1–80 grid. Then press Draw to see the 20 drawn numbers highlighted in yellow. Your matched numbers glow green.

Payout table (bet multipliers) examples for 6 picks: match 3 → 2×, match 4 → 8×, match 5 → 50×, match 6 → 1500×. Higher pick counts offer bigger jackpots but lower overall hit rates.

Bankroll: You start with $200. Each round costs your bet amount. Wins are added back. Session ends when rounds run out or bankroll is depleted.

Strategy tips: Picking fewer numbers (2–4 spots) gives more frequent but smaller wins. Picking 8–10 spots offers lottery-style jackpots but very rare wins. Six spots is the classic sweet spot for Keno — reasonable hit frequency with exciting jackpot potential. The house edge in Keno is higher than most casino games, so chase the fun, not profit.`,
  settings: videoKenoSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => (false ? null : { selector: '[data-testid="hint-target-video-keno-primary"]', pulses: 3 }),
  component: VideoKenoGame,
};
