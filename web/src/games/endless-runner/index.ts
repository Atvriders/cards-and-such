import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { EndlessRunnerState, EndlessRunnerAction, EndlessRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EndlessRunner } from "./EndlessRunner.js";

export const endlessRunnerSettings = {} as const;

export const endlessRunnerPlugin: GamePlugin<
  EndlessRunnerState,
  EndlessRunnerAction,
  typeof endlessRunnerSettings
> = {
  id: "endless-runner",
  title: "Endless Runner",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Auto-run and dodge obstacles. Jump over cacti, duck under bars.",
  howToPlay: `Your character runs automatically from left to right. Obstacles approach from the right and you must react in time to avoid them — the longer you survive, the faster the game gets.

There are two types of obstacles. Green cactus-like obstacles rise from the ground: jump over them by pressing Space, the Up arrow key, or the Jump button. Purple bars hang from overhead: duck under them by holding the Down arrow key or the Duck button. On touch screens, tap the canvas to jump.

You cannot jump while already in the air, so time each jump carefully. If you see a high bar coming, do not jump — stay low and duck instead. Getting the obstacle type wrong is the most common way to die.

The speed starts at 0.4 and ramps up continuously. In the early game, you have plenty of time to react. After a long run you will need to read incoming obstacles almost instantly. Obstacles are randomly spaced, so no two runs are the same.

Score is distance traveled in meters (game units × 100). There is no maximum — the game continues until you collide with an obstacle. Challenge yourself to beat your personal best with each run!`,
  settings: endlessRunnerSettings,
  initialState: (seed: number, settings: EndlessRunnerSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".runner-btn", pulses: 3 }; },
  component: EndlessRunner,
};
