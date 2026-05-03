import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PuyoState, PuyoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PuyoPop } from "./PuyoPop.js";

export const puyoSettings = {
  startLevel: {
    kind: "enum" as const,
    label: "Start level",
    options: ["1", "3", "5"] as const,
    default: "1" as const,
  },
} as const;

type PuyoSettingsType = SettingsOf<typeof puyoSettings>;

export const puyoPopPlugin: GamePlugin<PuyoState, PuyoAction, typeof puyoSettings> = {
  id: "puyo-pop-like",
  title: "Blob Drop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop pairs of colored blobs. Connect 4 or more of the same color to pop them. Chain reactions score big.",
  howToPlay: `Colored blob pairs fall from the top of the grid. Guide them into place to create connected groups of four or more blobs of the same color — when that happens, the whole group pops and disappears.

Move the falling pair left or right with the arrow keys (or A / D). Press Up or W to rotate the pair clockwise; press Z to rotate counter-clockwise. Press Down or S to soft-drop one row at a time, or Space to hard-drop instantly to the lowest position.

When a pair lands, blobs fall under gravity to fill any gaps. Connected same-color groups of four or more then pop. After popping, the remaining blobs fall again, which can trigger chain reactions. Chains multiply your score: the first pop scores normally, the second cascade doubles, the third triples, and so on.

The game ends when the grid fills to the top and a new pair cannot spawn. Level increases every 10 pairs dropped, making pieces fall faster.

Strategy tip: instead of chasing immediate pops, build up tall columns of same-color blobs. Then drop a single blob that connects two large groups to trigger a massive chain and skyrocket your score. The satellite blob (the one orbiting the pivot) can be rotated to any of the four directions, giving you fine control over placement.`,
  settings: puyoSettings,
  initialState: (seed: number, settings: PuyoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".puyo-board")) ? { selector: ".puyo-board", pulses: 3 } : null,
  component: PuyoPop,
};
