import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MilliganCellState, MilliganCellAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MilliganCell } from "./Game.js";

export const milliganCellPlugin: GamePlugin<MilliganCellState, MilliganCellAction, Record<string, never>> = {
  id: "milligan-cell",
  title: "Milligan Cell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell with 12 free cells instead of 4. An easier, spacious variant perfect for beginners.",
  howToPlay: `Milligan Cell is a relaxed variant of FreeCell. The same one deck of 52 cards is dealt face-up across eight tableau columns, with the first four columns holding seven cards each and the last four holding six cards each.

The big difference from standard FreeCell is that you have twelve free cells available — three times as many as usual. Each cell holds exactly one card as a temporary buffer.

Tableau: Build down in alternating colors (red on black, black on red). You may move a properly sequenced group of cards if you have enough empty cells and empty columns — the maximum you can move at once equals (1 + empty cells) × 2^(empty columns).

Foundations: Build each of the four suits up from Ace to King. As soon as a card can legally go to a foundation, you can click "Auto-move" to send all eligible cards automatically.

Goal: Move all 52 cards to the four foundations.

Strategy: With 12 cells the game is much more forgiving than standard FreeCell. Focus on uncovering Aces and getting suits onto foundations quickly. Even so, avoid filling all 12 cells simultaneously — keep at least a few open for maneuvering.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MilliganCell,
} as unknown as GamePlugin;
