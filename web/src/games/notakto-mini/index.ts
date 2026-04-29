import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const notaktoMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "notakto-mini",
  title: "Notakto (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Misère Tic-Tac-Toe — both players use X; avoid completing three in a row.",
  howToPlay: "Notakto is misère Tic-Tac-Toe: both players place the same symbol (X), and the player who completes three-in-a-row loses. This Mini edition uses a single 4×4 board for a slightly longer game than the classic 3×3 (where Notakto is fully solved).\n\nYou play first against a random CPU. Click any empty cell to place an X. Then the CPU places another X. Whoever's move first creates a row, column, or diagonal of three or more Xs loses immediately.\n\nThe board displays as a 4×4 grid. Both players' marks show in the same color since both play X. Filled cells are not selectable.\n\nNotakto reverses standard Tic-Tac-Toe thinking: you want to avoid completing a line. Tactically, push the CPU into corners where any move it makes will close a row. Because the CPU plays random moves, you can usually steer it into losing positions with a few careful placements. A win scores 100 plus a piece bonus; a draw (board full with no three-in-a-row, which is impossible on 4×4 in practice but allowed) is 25 points. Survive the longest losing path.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
