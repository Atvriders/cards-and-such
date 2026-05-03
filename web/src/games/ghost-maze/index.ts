import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GhostMazeState, GhostMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GhostMazeGame } from "./Game.js";

export const ghostMazeSettings = {
  ghostSpeed: {
    kind: "enum" as const,
    label: "Ghost Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type GhostMazeSettingsType = SettingsOf<typeof ghostMazeSettings>;

export const ghostMazePlugin: GamePlugin<GhostMazeState, GhostMazeAction, typeof ghostMazeSettings> = {
  id: "ghost-maze",
  title: "Ghost Maze",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Escape the haunted maze before the ghost catches you! Navigate to the exit while avoiding the pursuer.",
  howToPlay: `Ghost Maze is a race against a relentless pursuer. A ghost starts at the bottom-right corner while you begin at the top-left. Both of you share the same walled labyrinth — the ghost chases you in real time as you navigate.

Use arrow keys or WASD to move one cell per press. The ghost moves automatically on a timer: it hunts you by travelling toward your position, generally choosing the direction that reduces its distance to you — though it occasionally takes a random turn to keep things unpredictable.

Your goal is to reach the green G tile at the bottom-right before the ghost intercepts you. The ghost starts near the exit, so you may need to lure it away or find routes that keep it cornered.

Ghost Speed has three tiers: Slow gives you plenty of thinking time per move; Medium is a balanced challenge; Fast moves the ghost every player step, requiring efficient and direct navigation to win.

Escaping earns a large score bonus. Getting caught still scores points based on how far you travelled, so even a losing run is rewarding. Every new game generates a unique maze layout to keep you on your toes.`,
  settings: ghostMazeSettings,
  initialState: (seed: number, settings: GhostMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".ghost-maze-svg", pulses: 3 }; },
  component: GhostMazeGame,
};
