import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KeyMazeState, KeyMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KeyMazeGame } from "./Game.js";

export const keyMazeSettings = {
  keys: {
    kind: "enum" as const,
    label: "Keys to Collect",
    options: ["2", "3", "4"] as const,
    default: "3" as const,
  },
} as const;

type KeyMazeSettingsType = SettingsOf<typeof keyMazeSettings>;

export const keyMazePlugin: GamePlugin<KeyMazeState, KeyMazeAction, typeof keyMazeSettings> = {
  id: "key-maze",
  title: "Key Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Collect all keys scattered through the maze before you can unlock the exit door.",
  howToPlay: `Key Maze adds a collection objective to classic maze navigation. The exit door is locked — you must first find and collect every key hidden in the labyrinth before you can escape.

Keys are shown as gold K tiles scattered throughout the maze. The exit is in the bottom-right corner. When it shows a red X, you still need more keys. When it turns green and shows E, all keys are collected and you can walk out.

Navigate using the arrow keys or WASD. You can only step through open passages — the blue walls cannot be crossed. Each step counts toward your total move score, so plan an efficient route that sweeps up all the keys before heading to the exit.

The setting lets you choose 2, 3, or 4 keys. With 2 keys the detours are short; with 4 keys you need to plan a longer route through the full maze to collect everything.

Every game generates a fresh 11×11 maze with keys placed at random open cells. Because keys can appear anywhere, you must explore broadly before committing to an exit path. Score rewards efficiency: fewer total moves earn a higher result.`,
  settings: keyMazeSettings,
  initialState: (seed: number, settings: KeyMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".key-maze-svg")) ? { selector: ".key-maze-svg", pulses: 3 } : null,
  component: KeyMazeGame,
};
