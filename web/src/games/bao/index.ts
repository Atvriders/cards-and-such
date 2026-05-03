import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { BaoState, BaoAction, BaoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bao } from "./Game.js";

const settings = {} as const;

export const baoPlugin: GamePlugin<BaoState, BaoAction, typeof settings> = {
  id: "bao",
  title: "Bao",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swahili mancala — sow seeds around the board and capture opposite pits with Bao rules.",
  howToPlay: `Bao is the great mancala game of East Africa, especially popular in Tanzania and Kenya. This simplified version uses two rows of eight pits plus two stores. Each pit starts with 6 seeds. You play the bottom row; the bot plays the top row.

On your turn, choose one of your pits that has seeds. Pick up all the seeds and sow them counterclockwise (left to right in your row, then right to left in the bot's row), dropping one seed per pit and skipping the opponent's store.

Bao capture rule: if the last seed you sow lands in one of your own pits that already had seeds (making it contain 2 or more), you capture all seeds from the opponent's pit directly opposite and add them to your store. Landing in your store earns you an extra turn. Landing in an empty pit simply ends your turn with no capture.

The game ends when one side's pits are all empty. The remaining seeds in the other side's pits are swept into that side's store. The player with the most seeds in their store wins.

Click any of your bottom-row pits to sow. The bot plays at depth 4.`,
  settings,
  initialState: (seed: number, s: BaoSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".bao-board")) ? { selector: ".bao-board", pulses: 3 } : null,
  component: Bao,
};
