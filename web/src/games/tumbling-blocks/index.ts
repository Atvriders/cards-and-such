import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TumblingBlocksGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tumblingBlocksPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "tumbling-blocks",
  title: "Tumbling Blocks",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove blocks from a stack without toppling. Place vs random CPU.",
  howToPlay: "Tumbling Blocks is the family of dexterity stacking-removal games (Jenga-style) where players take turns removing blocks from a tower without causing it to fall. In this digital placement adaptation, blocks are arranged on a 5x5 grid and clicked-to-remove rather than physically pulled, with the CPU randomly choosing which block to remove on its turn.\n\nThe board starts entirely filled with P pieces. Click any P cell to remove that block — but BEWARE: if removing the block leaves a floating block above (a P piece in row directly above an empty cell with no support), the floating block falls and counts as a topple penalty. After your turn, the CPU randomly removes a P piece from the board.\n\nGameplay lasts up to 20 moves or until the board empties. You earn 100 points for finishing with no topple penalties, 25 if you ended with at most 3 topples, plus 4 points per safe removal you executed. The trick is to remove from the top rows first — bottom-row removals nearly always topple the row above. Plan your removals from top down to maintain stack integrity throughout.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".tbb-board")) ? { selector: ".tbb-board", pulses: 3 } : null,
  component: TumblingBlocksGame,
};
