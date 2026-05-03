import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IceSlideMazeState, IceSlideMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IceSlideMazeGame } from "./Game.js";

export const iceSlideMazeSettings = {
  size: {
    kind: "enum" as const,
    label: "Maze Size",
    options: ["small", "medium"] as const,
    default: "small" as const,
  },
} as const;

type IceSlideMazeSettingsType = SettingsOf<typeof iceSlideMazeSettings>;

export const iceSlideMazePlugin: GamePlugin<IceSlideMazeState, IceSlideMazeAction, typeof iceSlideMazeSettings> = {
  id: "ice-slide-maze",
  title: "Ice Slide Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide across the icy maze — you can't stop until you hit a wall! Reach the blue exit.",
  howToPlay: `Ice Slide Maze puts a slippery twist on traditional mazes. When you press a direction, your character slides in that direction across the icy floor and does not stop until hitting a wall or the maze boundary.

Your yellow dot starts near the top-left. The goal is the cyan diamond near the bottom-right. Use arrow keys or WASD to slide. Small white dots preview where each slide will take you so you can plan before committing.

The key skill is thinking two or three moves ahead. A straight slide might carry you past a critical junction. You need to use walls as brakes, positioning yourself precisely to line up for the next required slide.

The maze is generated fresh each game using a grid-carving algorithm. Walls are the dark blue cells; ice (passable floor) is the light blue. You cannot enter wall cells.

Small uses an 11×11 grid with fewer decision points; Medium is 15×15 with many more braking options to consider. Score is based on the number of slides taken — fewest slides wins.`,
  settings: iceSlideMazeSettings,
  initialState: (seed: number, settings: IceSlideMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ice-maze-svg")) ? { selector: ".ice-maze-svg", pulses: 3 } : null,
  component: IceSlideMazeGame,
};
