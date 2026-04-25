import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SequenceFlashState, SequenceFlashAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SequenceFlash } from "./SequenceFlash.js";

export const sequenceFlashSettings = {} as const;

export const sequenceFlashPlugin: GamePlugin<SequenceFlashState, SequenceFlashAction, typeof sequenceFlashSettings> = {
  id: "sequence-flash",
  title: "Sequence Flash",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch cells flash on a grid, then tap them back in order.",
  howToPlay: `Sequence Flash is a spatial memory challenge played on a 3x3 grid. Each round the game highlights one or more cells in sequence — cells flash one by one in a specific order. When the flash sequence ends, it's your turn to tap the same cells in the exact same order.

Press Start to watch the first flash. Just one cell lights up in round one. If you tap correctly, you advance to round two where the sequence has two cells, then three, and so on. Each mistake ends the game and your score equals the number of rounds you completed before failing.

The key skill here is tracking both which cells flash and the order they flash in. A cell might appear more than once in a sequence, so pay attention to repetition.

Strategy tips: Mentally label the grid cells by position — top-left, top-center, top-right, and so on. As you watch each flash, narrate the positions silently: "top-left, bottom-right, center." Linking positions to a story or route through the grid (like reading a path) helps encode the sequence in spatial memory. For longer sequences, try chunking: memorize the first three as a group, then the next three. Speed matters less than accuracy — take your time on input.`,
  settings: sequenceFlashSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: SequenceFlash,
};
