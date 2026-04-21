import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheckersState, CheckersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Checkers } from "./Checkers.js";

export const checkersSettings = {
  mandatoryCapture: {
    kind: "boolean" as const,
    label: "Mandatory Capture",
    default: true,
  },
  flyingKings: {
    kind: "boolean" as const,
    label: "Flying Kings",
    default: false,
  },
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
  botDepth: {
    kind: "enum" as const,
    label: "Bot Depth",
    options: ["2", "3", "4"] as const,
    default: "2",
  },
} as const;

type CheckersSettingsType = SettingsOf<typeof checkersSettings>;

export const checkersPlugin: GamePlugin<CheckersState, CheckersAction, typeof checkersSettings> = {
  id: "checkers",
  title: "Checkers",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "American Checkers with mandatory capture and king promotion.",
  settings: checkersSettings,
  initialState: (seed: number, settings: CheckersSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Checkers,
};
