import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BalloonPopState, type BalloonPopAction } from "./state.js";
import { BalloonPop } from "./BalloonPop.js";

export const balloonPopSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

export const balloonPopPlugin: GamePlugin<BalloonPopState, BalloonPopAction, typeof balloonPopSettings> = {
  id: "balloon-pop",
  title: "Balloon Pop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click groups of same-colored balloons to pop them. Bigger groups score more!",
  howToPlay: `Balloon Pop is a group-clearing puzzle game played on an 8×8 grid. Each cell contains a colored balloon.

Click any balloon that is part of a group of 2 or more same-colored adjacent balloons (connected horizontally or vertically). All balloons in that group pop at once! Single isolated balloons cannot be popped.

After a group is popped, balloons fall down due to gravity to fill empty spaces, and empty columns shift left. This can create new groups that were previously separated.

Scoring: popping a group of N balloons scores N × (N-1) points, multiplied by a color bonus. Higher-numbered colors (whichever appears rarer) carry a bigger bonus. Clearing the entire board awards a 500-point bonus.

Strategy: larger groups always score more per balloon — a group of 10 scores 90, while two groups of 5 score 40 total. Plan ahead to merge smaller groups before popping. Look for moves that will cascade — popping one group may drop other balloons into new groups.

Settings: fewer colors makes larger groups more likely; more colors produces a more fragmented board that requires careful planning.`,
  settings: balloonPopSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".bp-grid")) ? { selector: ".bp-grid", pulses: 3 } : null,
  component: BalloonPop,
};
