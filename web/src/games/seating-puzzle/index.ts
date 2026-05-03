import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SeatingState, SeatingAction, SeatingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeatingPuzzleGame } from "./Game.js";

const settings = {} as const;

export const seatingPuzzlePlugin: GamePlugin<SeatingState, SeatingAction, typeof settings> = {
  id: "seating-puzzle",
  title: "Seating Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arrange people into numbered seats using clues about adjacency, position, and order.",
  howToPlay: `Seating Puzzle challenges you to place a group of people into numbered seats in a row, using a set of logical clues. Every clue is true and together they uniquely determine the seating order.

Clue types you'll encounter: direct assignments ("Alice is at seat 2"), adjacency ("Bob sits immediately to the right of Carol"), negation ("Dave is not at seat 1"), and relative constraints ("Eve is between Frank and Grace").

To play: click a person's name from the Bench panel to select them — their name will highlight. Then click a numbered seat to place them there. If you change your mind, click the selected person again to deselect, or click a different person to switch. You can also click an occupied seat to re-select that person and move them elsewhere.

Work through the most specific clues first. Direct-position clues fix a person immediately. Negation clues eliminate possibilities. Adjacency clues establish relative order once one anchor is set.

The puzzle is solved when all seats are filled correctly. Score is based on moves used — fewer moves means a higher score. Use Reset to start fresh. Each puzzle has a unique valid solution reachable by pure deduction.`,
  settings,
  initialState: (seed: number, s: SeatingSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".seating-remove-btn", pulses: 3 }; },
  component: SeatingPuzzleGame,
};
