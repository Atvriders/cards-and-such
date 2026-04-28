import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SlidePuzzle3x3State, SlidePuzzle3x3Action, SlidePuzzle3x3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SlidePuzzle3x3Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const slidePuzzle3x3Plugin: GamePlugin<SlidePuzzle3x3State, SlidePuzzle3x3Action, typeof settings> = {
  id:"slide-puzzle-3x3", title:"Slide Puzzle 3x3", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Classic 8-puzzle: slide numbered tiles into order on a 3x3 grid.",
  howToPlay:`Slide Puzzle 3x3 is the classic 8-puzzle: a 3x3 grid holds tiles numbered 1 through 8 plus one blank space. Your goal is to slide tiles into ascending order, left-to-right, top-to-bottom, with the blank ending in the bottom-right corner.

Click any tile orthogonally adjacent to the blank to slide it in. The blank moves to where the tile came from. Plan your moves carefully — every shuffle starts from a solvable random position, but a wrong sequence can lock pieces away from where they need to be.

Your score rewards efficiency: 500 points minus 5 per move, with a 50-point floor. A clean solve under 30 moves is excellent; under 50 is solid; over 90 means it's time to study some sliding-puzzle techniques (corner first, then edges, then the final two-row dance).

When the puzzle is solved, the timer stops and your final tally is locked in. Press Play Again to scramble for another go.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SlidePuzzle3x3Settings),
  reducer, isTerminal, component: SlidePuzzle3x3Game,
};
