import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KharbagaState, KharbagaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kharbaga } from "./Game.js";

export const kharbagaSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type KharbagaSettingsType = SettingsOf<typeof kharbagaSettings>;

export const kharbagaPlugin: GamePlugin<KharbagaState, KharbagaAction, typeof kharbagaSettings> = {
  id: "kharbaga",
  title: "Kharbaga",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "North African 5×5 orthogonal draughts — capture all opponents to win.",
  howToPlay: `Kharbaga is a traditional North African draughts game, popular in Algeria and Morocco. It is played on a 5×5 board with all 25 squares in use. Each player begins with ten pieces occupying the two rows nearest their side. You play White (bottom two rows); the bot plays Black (top rows).

All movement is orthogonal — pieces move one square up, down, left, or right to an adjacent empty square. Captures are mandatory: when an opponent's piece sits adjacent to yours with an empty square directly beyond, you must jump. If another capture is available immediately after landing, you must continue capturing. You must always take the maximum number of pieces in one move. Men capture in all four directions. There are no Kings in standard Kharbaga.

The goal is to capture all of your opponent's pieces. There are no draws in a well-played game because the board is small and captures are compulsory.

Scoring: win = 20; loss = 0.

Tips: controlling the centre row is vital. Push pieces inward early to threaten captures from multiple directions.`,
  settings: kharbagaSettings,
  initialState: (seed: number, settings: KharbagaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".kharbaga-board")) ? { selector: ".kharbaga-board", pulses: 3 } : null,
  component: Kharbaga,
};
