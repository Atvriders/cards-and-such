import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArmenianDraughtsState, ArmenianDraughtsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArmenianDraughts } from "./Game.js";

export const armenianDraughtsSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type ArmenianDraughtsSettingsType = SettingsOf<typeof armenianDraughtsSettings>;

export const armenianDraughtsPlugin: GamePlugin<ArmenianDraughtsState, ArmenianDraughtsAction, typeof armenianDraughtsSettings> = {
  id: "armenian-draughts",
  title: "Armenian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Orthogonal draughts where men capture in all four directions.",
  howToPlay: `Armenian Draughts is an orthogonal draughts variant closely related to Turkish Draughts (Dama), played on all 64 squares of an 8×8 board. The key distinction is that ordinary men may capture in all four orthogonal directions — including backward — making it a more aggressive and tactical game.

You play White (bottom two rows); the bot plays Black (top two rows). Men move forward or sideways one square. Captures are mandatory and you must take the maximum available captures in one turn. Jump over an adjacent opponent piece to the empty square beyond; if another capture is immediately available, you must continue. Reaching the opponent's back row promotes a piece to a King, which slides freely in all directions like a flying king.

Strategy: the ability for men to capture backward opens up more tactical combinations than Turkish Draughts. Watch for your pieces being caught in back-rank traps. Try to achieve a King quickly to gain the flying advantage.

Scoring: win = 20; loss = 0.`,
  settings: armenianDraughtsSettings,
  initialState: (seed: number, settings: ArmenianDraughtsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".armdraughts-board")) ? { selector: ".armdraughts-board", pulses: 3 } : null,
  component: ArmenianDraughts,
};
