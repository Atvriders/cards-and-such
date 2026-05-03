import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnakeState, SnakeAction, Dir } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Snake = /* @__PURE__ */ lazy(() => import("./Snake.js").then((mod) => ({ default: mod.Snake as unknown as React.ComponentType<unknown> })));
export const snakeSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Board size",
    options: ["15", "20", "25"] as const,
    default: "20" as const,
  },
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
  wrap: {
    kind: "boolean" as const,
    label: "Walls wrap around",
    default: false,
  },
} as const;

type SnakeSettingsType = SettingsOf<typeof snakeSettings>;

export const snakePlugin: GamePlugin<SnakeState, SnakeAction, typeof snakeSettings> = {
  id: "snake",
  title: "Snake",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Snake. Eat food, grow, don't hit yourself.",
  howToPlay: `Guide the snake to eat food and grow as long as possible without crashing.

Use the arrow keys or WASD to turn the snake. Press Space to pause and resume. Each time the snake eats the red food tile it grows by one segment and a new food tile appears elsewhere on the grid. The game ends immediately if the snake runs into a wall or its own body.

Score equals the current length of the snake — the longer you survive, the higher your score. The grid can be set to 15×15, 20×20, or 25×25. Speed can be slow, medium, or fast. Enable "Walls wrap around" to let the snake pass through walls and emerge on the opposite side, removing the wall-collision threat entirely.

Tips: Plan your path ahead, especially at higher speeds. Favor looping paths that keep the center of the board open. On large grids at slow speed, focus on building length first before attempting riskier maneuvers near your own tail.`,
  settings: snakeSettings,
  initialState: (seed: number, settings: SnakeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SnakeState): HintTarget | null => {
    if (!state.alive || state.paused) return null;
    const head = state.snake[0];
    if (!head) return null;
    const { gridSize, food, snake } = state;
    const occupied = new Set(snake.map((c) => `${c.row},${c.col}`));
    const wrap = state.settings.wrap;

    function safeAndScore(dir: Dir): { ok: boolean; dist: number } {
      let r = head!.row;
      let c = head!.col;
      if (dir === "up") r -= 1;
      else if (dir === "down") r += 1;
      else if (dir === "left") c -= 1;
      else if (dir === "right") c += 1;
      if (wrap) {
        r = ((r % gridSize) + gridSize) % gridSize;
        c = ((c % gridSize) + gridSize) % gridSize;
      } else if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
        return { ok: false, dist: Infinity };
      }
      // Self-collision (ignore tail since it moves)
      const tail = snake[snake.length - 1];
      const key = `${r},${c}`;
      if (occupied.has(key) && !(tail && tail.row === r && tail.col === c)) {
        return { ok: false, dist: Infinity };
      }
      const dr = wrap
        ? Math.min(Math.abs(r - food.row), gridSize - Math.abs(r - food.row))
        : Math.abs(r - food.row);
      const dc = wrap
        ? Math.min(Math.abs(c - food.col), gridSize - Math.abs(c - food.col))
        : Math.abs(c - food.col);
      return { ok: true, dist: dr + dc };
    }

    function isOpposite(a: Dir, b: Dir): boolean {
      return (
        (a === "up" && b === "down") ||
        (a === "down" && b === "up") ||
        (a === "left" && b === "right") ||
        (a === "right" && b === "left")
      );
    }

    const dirs: Dir[] = ["up", "down", "left", "right"];
    let best: Dir | null = null;
    let bestDist = Infinity;
    for (const d of dirs) {
      if (isOpposite(d, state.direction)) continue;
      const { ok, dist } = safeAndScore(d);
      if (ok && dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    if (!best) return null;
    let r = head.row;
    let c = head.col;
    if (best === "up") r -= 1;
    else if (best === "down") r += 1;
    else if (best === "left") c -= 1;
    else if (best === "right") c += 1;
    if (wrap) {
      r = ((r % gridSize) + gridSize) % gridSize;
      c = ((c % gridSize) + gridSize) % gridSize;
    }
    return { selector: `[data-testid="hint-target-snake-${r}-${c}"]`, pulses: 3 };
  },
  component: Snake,
};
