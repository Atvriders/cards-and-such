import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WeeklyChess960State, WeeklyChess960Action, WeeklyChess960Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WeeklyChess960Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const weeklyChess960Plugin: GamePlugin<WeeklyChess960State, WeeklyChess960Action, typeof settings> = {
  id: "weekly-chess960", title: "Weekly Chess960", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Weekly puzzle format quiz. Identify chess960 starting position descriptors.",
  howToPlay: "Weekly Chess960 quizzes you on the Fischer Random Chess (Chess960) variant in a weekly-puzzle quiz format. Each of twelve rounds presents a starting-position descriptor or tactical motif from one of the 960 randomized starting positions and asks you to identify which board property it represents (e.g., bishop pair on light squares, knights flanking the king, etc.). Ten points per correct, max 120. Chess960 was invented by Bobby Fischer in 1996 to emphasize chess understanding over opening-book memorization. The 960 unique starting positions all preserve key constraints: bishops on opposite colors, king between rooks, identical Black setup mirrored from White. Tournament players nail 100+; club players aim for 60-80. Two minutes start to finish. Submit on each pick and Next to advance. Useful as a refresher between weekly online chess960 sessions on Lichess or Chess.com — both run regular Chess960 weekly events alongside their daily puzzle queues.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WeeklyChess960Settings),
  reducer, isTerminal, component: WeeklyChess960Game,
};
