import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SurakartaState, SurakartaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SurakartaGame } from "./Game.js";

const settings = {} as const;

export const surakartaPlugin: GamePlugin<SurakartaState, SurakartaAction, typeof settings> = {
  id: "surakarta",
  title: "Surakarta",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Indonesian game: move or loop-capture around corner arcs.",
  howToPlay: `Surakarta is a traditional Indonesian abstract strategy game played on a 6×6 grid decorated with four curved loops at each corner. You play dark pieces starting on the bottom two rows; the bot plays light pieces from the top two rows.

On your turn you may make one of two types of moves:

Normal move: slide one of your pieces one step to any adjacent empty square — orthogonal or diagonal.

Loop capture: travel your piece along one of the loop tracks (the curved arcs at the corners), passing through as many cells as needed, until you land on an opponent's piece and capture it. You must traverse at least a portion of a corner arc to make a capture — you cannot simply "jump" across the board without using the arc. Captured pieces are removed permanently.

Loop captures are optional, not mandatory. However, because pieces cannot be captured except by the loop mechanism, positioning your pieces on or near the loop tracks (rows and columns 0, 1, 4, or 5) is key to both attacking and defending.

Win by capturing all 12 of the opponent's pieces.

Bot strategy: minimax at depth 2, preferring captures and maximizing piece count advantage.

Tip: control the loop tracks early — pieces on the inner rails (rows/cols 1 and 4) can slide onto the arcs quickly to threaten captures.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sura-svg")) ? { selector: ".sura-svg", pulses: 3 } : null,
  component: SurakartaGame,
};
