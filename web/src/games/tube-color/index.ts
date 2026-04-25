import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TubeColorState, TubeColorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TubeColor } from "./TubeColor.js";

const tubeColorSettings = {
  tubes: {
    kind: "enum" as const,
    label: "Tubes",
    options: ["6", "8", "10"] as const,
    default: "8" as const,
  },
} as const;

export const tubeColorPlugin: GamePlugin<TubeColorState, TubeColorAction, typeof tubeColorSettings> = {
  id: "tube-color",
  title: "Tube Color",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sort colored water into tubes so each tube contains only one color.",
  howToPlay: `Each test tube holds up to four layers of colored water. Your goal is to sort the colors so that each tube contains only one color from bottom to top.

Click a tube to select it (it highlights red). Then click another tube to pour water from the first into the second. The pour only works if the top color in the source tube matches the top color in the destination tube, or if the destination is empty. Multiple layers of the same color will pour together in one move.

You cannot pour into a full tube. Empty tubes act as temporary holding spaces — use them strategically to unblock colors that are buried underneath others.

The puzzle is complete when every non-empty tube holds exactly four layers of the same color. Tubes with a green border are already complete.

Tips: identify which colors are closest to being grouped and work backward. Avoid filling the empty tubes too early — keep at least one empty tube free as a buffer. Move the top-most single-color blocks first to create space. Fewer total pours earns a higher score.`,
  settings: tubeColorSettings,
  initialState,
  reducer,
  isTerminal,
  component: TubeColor,
};
