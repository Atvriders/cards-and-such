import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Dir = "up" | "down" | "left" | "right";

export interface Coord {
  row: number;
  col: number;
}

export interface SnakeSettings {
  gridSize: "15" | "20" | "25";
  speed: "slow" | "medium" | "fast";
  wrap: boolean;
}

export interface SnakeState {
  settings: SnakeSettings;
  gridSize: number;
  snake: readonly Coord[];
  direction: Dir;
  nextDirection: Dir;
  food: Coord;
  alive: boolean;
  paused: boolean;
  rngSeed: number;
  ticks: number;
}

export type SnakeAction =
  | { type: "tick" }
  | { type: "turn"; direction: Dir }
  | { type: "pause" }
  | { type: "resume" };

function isOpposite(a: Dir, b: Dir): boolean {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

function coordsEqual(a: Coord, b: Coord): boolean {
  return a.row === b.row && a.col === b.col;
}

function spawnFood(snake: readonly Coord[], gridSize: number, seed: number): { food: Coord; nextSeed: number } {
  // Collect empty cells
  const occupied = new Set(snake.map((c) => `${c.row},${c.col}`));
  const empty: Coord[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ row: r, col: c });
      }
    }
  }

  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(seed);
  const idx = Math.floor(rng2() * empty.length);
  const food = empty[idx] ?? { row: 0, col: 0 };
  return { food, nextSeed };
}

export function initialState(seed: number, settings: SnakeSettings): SnakeState {
  const gridSize = parseInt(settings.gridSize, 10);
  const midRow = Math.floor(gridSize / 2);
  const midCol = Math.floor(gridSize / 2);

  // Snake starts as 3 cells, head at center, moving right
  const snake: Coord[] = [
    { row: midRow, col: midCol },
    { row: midRow, col: midCol - 1 },
    { row: midRow, col: midCol - 2 },
  ];

  const { food, nextSeed } = spawnFood(snake, gridSize, seed);

  return {
    settings,
    gridSize,
    snake,
    direction: "right",
    nextDirection: "right",
    food,
    alive: true,
    paused: false,
    rngSeed: nextSeed,
    ticks: 0,
  };
}

export function reducer(state: SnakeState, action: SnakeAction): SnakeState {
  switch (action.type) {
    case "tick": {
      if (!state.alive || state.paused) return state;

      // Apply nextDirection (safety: reject 180° flip)
      const dir = isOpposite(state.nextDirection, state.direction)
        ? state.direction
        : state.nextDirection;

      // Compute new head
      const head = state.snake[0]!;
      let newRow = head.row;
      let newCol = head.col;

      if (dir === "up") newRow -= 1;
      else if (dir === "down") newRow += 1;
      else if (dir === "left") newCol -= 1;
      else if (dir === "right") newCol += 1;

      const { gridSize } = state;

      // Wall collision or wrap
      if (!state.settings.wrap) {
        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
          return { ...state, direction: dir, alive: false };
        }
      } else {
        newRow = ((newRow % gridSize) + gridSize) % gridSize;
        newCol = ((newCol % gridSize) + gridSize) % gridSize;
      }

      const newHead: Coord = { row: newRow, col: newCol };

      // Check self-collision (against all cells except tail-to-be-removed)
      const snakeWithoutTail = state.snake.slice(0, -1);
      if (snakeWithoutTail.some((c) => coordsEqual(c, newHead))) {
        return { ...state, direction: dir, alive: false };
      }

      // Check food
      const ateFood = coordsEqual(newHead, state.food);
      let newSnake: readonly Coord[];
      let newFood = state.food;
      let newRngSeed = state.rngSeed;

      if (ateFood) {
        newSnake = [newHead, ...state.snake];
        // Board full?
        if (newSnake.length === gridSize * gridSize) {
          return {
            ...state,
            direction: dir,
            snake: newSnake,
            alive: false,
            ticks: state.ticks + 1,
          };
        }
        const spawned = spawnFood(newSnake, gridSize, state.rngSeed);
        newFood = spawned.food;
        newRngSeed = spawned.nextSeed;
      } else {
        newSnake = [newHead, ...state.snake.slice(0, -1)];
      }

      return {
        ...state,
        direction: dir,
        nextDirection: dir,
        snake: newSnake,
        food: newFood,
        rngSeed: newRngSeed,
        ticks: state.ticks + 1,
      };
    }

    case "turn": {
      // Reject 180° flip
      if (isOpposite(action.direction, state.direction)) return state;
      return { ...state, nextDirection: action.direction };
    }

    case "pause":
      return { ...state, paused: true };

    case "resume":
      return { ...state, paused: false };

    default:
      return state;
  }
}

export function isTerminal(state: SnakeState): { score: number } | null {
  if (!state.alive) return { score: state.snake.length };
  return null;
}
