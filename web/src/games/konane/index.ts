import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KonaneState, KonaneAction, KonaneSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Konane } from "./Game.js";

const settings = {} as const;

export const konanePlugin: GamePlugin<KonaneState, KonaneAction, typeof settings> = {
  id: "konane",
  title: "Konane",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hawaiian checkers — jump opponent stones until no moves remain.",
  howToPlay: `Konane is a traditional Hawaiian strategy game played on an 8×8 board filled with alternating Black and White stones. You play as Black; the bot plays White. The player who cannot move loses.

The game begins with an opening ceremony: first, Black removes one of the four central black stones. Then White removes one white stone adjacent to the gap created. This sets up the first possible jump.

During play, you move by jumping over an adjacent opponent stone into an empty space beyond it, removing the captured stone. Jumps are only made orthogonally (horizontal or vertical — no diagonals). In a single turn, you may continue jumping in the same direction as many times as possible (chain jumps); click "End Turn" when you wish to stop. Changing direction mid-turn is not allowed.

Select a Black stone by clicking it, then click the highlighted destination to jump. The bot uses minimax at depth 3 to find strong moves. Tip: try to position stones so the bot runs out of jumps before you do — denying your opponent moves is the key strategy.`,
  settings,
  initialState: (seed: number, s: KonaneSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Konane,
};
