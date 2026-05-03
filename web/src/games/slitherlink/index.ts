import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SlitherlinkState, SlitherlinkAction, SlitherlinkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Slitherlink } from "./Game.js";

export const slitherlinkSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const slitherlinkPlugin: GamePlugin<SlitherlinkState, SlitherlinkAction, typeof slitherlinkSettings> = {
  id: "slitherlink",
  title: "Slitherlink",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a single closed loop through dots so each numbered cell has exactly that many loop edges.",
  howToPlay: `Slitherlink is a loop-drawing logic puzzle. The grid shows dots at every intersection. Your task is to draw a single, continuous, closed loop connecting those dots using only horizontal and vertical segments — no branches, no crossings.

The numbers in some squares tell you exactly how many of that square's four sides (edges) belong to the loop. A 0 means none of its edges are in the loop. A 3 means three of its four sides are used. Cells without a number may have any count of loop edges.

To play: click any segment (the space between two adjacent dots) to toggle it on or off. Active segments glow blue. The puzzle is solved when you complete a valid single closed loop that satisfies every numbered clue.

Difficulty controls the grid size and the density of clues: Easy uses a 5×5 grid with many hints, Medium a 6×6 grid, and Hard a 7×7 grid with fewer clues.

Strategy: start with cells marked 0 (no edges — mark those sides as unused) and 3 (almost fully enclosed — you can deduce the open side from neighbors). Work from corners and edges of the grid inward. Never let the loop branch or create a disconnected sub-loop.

Score = max(100, 1000 − moves × 5).`,
  settings: slitherlinkSettings,
  initialState: (seed: number, s: SlitherlinkSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".slitherinksketch-svg")) ? { selector: ".slitherinksketch-svg", pulses: 3 } : null,
  component: Slitherlink,
};
