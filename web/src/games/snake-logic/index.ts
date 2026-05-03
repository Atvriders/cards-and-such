import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SnakeLogicState, SnakeLogicAction, SnakeLogicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnakeLogicGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const snakeLogicPlugin: GamePlugin<SnakeLogicState, SnakeLogicAction, typeof settings> = {
  id: "snake-logic",
  title: "Snake Logic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find hidden snake path from head to tail using count clues.",
  howToPlay: "Snake Logic asks you to find a hidden snake path in a grid. The snake's head and tail are marked. The snake is a non-self-touching orthogonal path from head to tail; it cannot share an edge with itself except at the path's natural connections.\n\nNumbers on the grid count adjacent snake cells (up, down, left, right). Use these clues to deduce the snake's exact path.\n\nIn this mini version each puzzle shows a small grid with the head, tail, and one or two clue numbers. The prompt asks which cell the snake passes through next given the constraints.\n\nSix puzzles per round, scoring 100 each plus a 10-point time bonus per remaining second. Wrong picks reveal the right cell.\n\nSnake Logic is a satisfying length-and-shape puzzle. The non-touching rule (snake can't double back to be adjacent to itself except via the path) eliminates lots of options once a few cells are placed. Start at the head and tail and work inward, using clue numbers to constrain the middle.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SnakeLogicSettings),
  reducer,
  isTerminal,
  
  hint: (state: SnakeLogicState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-snake-logic-answer-0"]', pulses: 3 } : null,component: SnakeLogicGame,
};
