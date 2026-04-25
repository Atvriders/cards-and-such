import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HareState, HareAction, HareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HareAndHounds } from "./Game.js";

const settings = {} as const;

export const hareAndHoundsPlugin: GamePlugin<HareState, HareAction, typeof settings> = {
  id: "hare-and-hounds",
  title: "Hare and Hounds",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play the hare and slip past three hounds on a 5×4 grid.",
  howToPlay: `Hare and Hounds is a classic asymmetric pursuit game. You play as the hare; the bot plays three hounds. The hounds start on the left edge; the hare starts near the right side.

The board is a 5×4 grid with diagonal connections on alternating squares, giving each cell between two and eight neighbours. Pieces move one step to any connected neighbour per turn.

The key asymmetry: hounds may only move right, up, or down — they can never retreat left. The hare may move in any direction, including left.

You win (as the hare) by moving to a column to the left of all three hounds — you have slipped past them and they cannot give chase. The bot wins if it surrounds the hare so that no legal hare move exists.

Hare strategy: don't rush straight left. Weave diagonally to draw hounds out of position, then slip through the gap. Patience and misdirection beat raw speed every time. Watch for the hounds forming a wall — you must break it before it seals completely, as once all three face you in a line you have no escape route.`,
  settings,
  initialState: (seed: number, s: HareSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: HareAndHounds,
};
