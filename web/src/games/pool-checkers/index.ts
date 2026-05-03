import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { PCState, PCAction, PCSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PoolCheckers } from "./Game.js";

const settings = {} as const;

export const poolCheckersPlugin: GamePlugin<PCState, PCAction, typeof settings> = {
  id: "pool-checkers",
  title: "Pool Checkers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Southern US checkers variant with flying kings and backward captures for men.",
  howToPlay: `Pool Checkers is a variant of checkers popular in the American South, particularly in African-American communities, and played in official World Pool Checkers Championship tournaments. It is played on an 8×8 board with 12 pieces per side. You play White; the bot plays Black.

Pool Checkers differs from standard American Checkers in two important ways: men may capture both forward and backward (not just forward), and kings are flying kings that slide any number of squares diagonally. These rules create a more dynamic and attacking game.

Capture is mandatory whenever one is available. If multiple captures exist, you may choose which one to take — there is no requirement to capture the maximum number. After jumping, if your piece can continue jumping, you must do so.

A man promotes to a flying king upon reaching the back row. Kings slide any number of squares diagonally and jump over any enemy piece along their path, landing beyond it. Click a piece to select it; highlighted squares show legal destinations. Click a destination to move.

Beat the bot (minimax depth 4) by promoting kings early and using backward captures to escape traps.`,
  settings,
  initialState: (seed: number, s: PCSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".pc-board")) ? { selector: ".pc-board", pulses: 3 } : null,
  component: PoolCheckers,
};
