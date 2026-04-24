import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxState, QwixxAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Qwixx } from "./Qwixx.js";

const qwixxSettings = {
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["normal", "easy"] as const,
    default: "normal" as const,
  },
} as const;

type QwixxSettingsType = SettingsOf<typeof qwixxSettings>;

export const qwixxPlugin: GamePlugin<QwixxState, QwixxAction, typeof qwixxSettings> = {
  id: "qwixx",
  title: "Qwixx",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cross off numbers on four colored rows using dice sums. Lock rows and maximize your score.",
  howToPlay: `Qwixx is a fast-paced dice game where you fill in numbers on four colored score sheets. Roll 6 dice — 2 white and one each of red, yellow, blue, and green.

After each roll you must either mark a number or take a penalty. The white dice sum can be marked in any row. Additionally, you may mark a white die + the matching color die in that row. Red and Yellow rows count 2 through 12 left-to-right; Blue and Green count 12 down to 2.

You can only mark numbers to the right of your last mark on each row — you can never go back. To lock a row (which adds a bonus mark), you must mark the final number (12 for Red/Yellow, 2 for Blue/Green) and have at least 5 marks in that row.

The game ends when two rows are locked or you collect 4 penalties (shown as X marks). Score each row using the triangular scoring table: 1 mark = 1 pt, 2 = 3, 3 = 6, 4 = 10, ... up to 66 pts for 11 marks. Each penalty subtracts 5 points. Maximize your score by planning ahead.`,
  settings: qwixxSettings,
  initialState: (seed: number, settings: QwixxSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Qwixx,
};
