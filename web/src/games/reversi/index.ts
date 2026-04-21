import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReversiState, ReversiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Reversi } from "./Reversi.js";

export const reversiSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ReversiSettingsType = SettingsOf<typeof reversiSettings>;

export const reversiPlugin: GamePlugin<ReversiState, ReversiAction, typeof reversiSettings> = {
  id: "reversi",
  title: "Reversi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flank opponent discs to flip them. Most discs wins.",
  settings: reversiSettings,
  initialState: (seed: number, settings: ReversiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Reversi,
};
