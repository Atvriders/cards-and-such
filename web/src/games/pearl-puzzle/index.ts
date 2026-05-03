import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PearlState, PearlAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pearl } from "./Pearl.js";

const pearlSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof pearlSettings>;

export const pearlPuzzlePlugin: GamePlugin<PearlState, PearlAction, typeof pearlSettings> = {
  id: "pearl-puzzle",
  title: "Pearl",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a closed loop through pearl cells — black pearls force turns, white pearls force straights.",
  howToPlay: `Pearl (also called Masyu-inspired or Irasuto) is a loop-drawing puzzle closely related to Masyu. Your goal is to draw a single closed loop along the grid lines connecting the dots. The loop must satisfy every pearl clue on the grid.

Black pearls: the loop must make a 90° turn at the black pearl's cell, and the loop must continue straight (without turning) through both of the cells immediately before and after the turn on each side. In other words, the loop enters from one direction, turns at the black pearl, and exits in a perpendicular direction — but straight for at least one step on each side.

White pearls: the loop must pass straight through the white pearl's cell without turning there. However, the loop must turn in at least one of the two cells immediately adjacent to the white pearl along the loop's path.

To draw: click near the midpoint of any edge between two adjacent dots to toggle that edge on or off. The loop turns blue when drawn and green when solved.

Start with black pearls — their turn + two-straight constraint pins down a lot of the loop. White pearls then lock in direction. Fill in the rest using connectivity of the closed loop.

Click Reset to start over.`,
  settings: pearlSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-pearl-puzzle-action"]', pulses: 3 }; },
  component: Pearl,
};
