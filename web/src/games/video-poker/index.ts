import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VideoPokerState, VideoPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VideoPoker } from "./VideoPoker.js";

export const videoPokerSettings = {
  betSize: {
    kind: "enum" as const,
    label: "Bet Size",
    options: ["1", "5"] as const,
    default: "1",
  },
  paytable: {
    kind: "enum" as const,
    label: "Paytable",
    options: ["9/6", "8/5"] as const,
    default: "9/6",
  },
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 10,
    max: 200,
    step: 10,
    default: 50,
  },
} as const;

type VideoPokerSettingsType = SettingsOf<typeof videoPokerSettings>;

export const videoPokerPlugin: GamePlugin<VideoPokerState, VideoPokerAction, typeof videoPokerSettings> = {
  id: "video-poker",
  title: "Video Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jacks-or-Better. Hold cards, draw replacements, win credits on qualifying hands.",
  settings: videoPokerSettings,
  initialState: (seed: number, settings: VideoPokerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: VideoPoker,
};
