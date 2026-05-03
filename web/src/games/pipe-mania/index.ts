import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipeManiaState, PipeManiaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipeMania } from "./PipeMania.js";

export const pipeManiaSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "7"] as const,
    default: "7" as const,
  },
} as const;

type PipeManiaSettingsType = SettingsOf<typeof pipeManiaSettings>;

export const pipeManiaPlugin: GamePlugin<PipeManiaState, PipeManiaAction, typeof pipeManiaSettings> = {
  id: "pipe-mania",
  title: "Pipe Mania",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place pipe segments from your queue onto the grid before the water floods through. Build the longest possible pipeline.",
  howToPlay: `A source tile is placed on the left side of the grid. Water will begin to flow from it automatically after a short delay and keeps advancing every second. Your goal is to lay pipe pieces in front of the flowing water to keep it flowing as long as possible.

The queue on the right shows the upcoming pipe pieces. Click any empty cell on the grid to place the current piece from the front of the queue. You cannot choose which piece to place — you must work with whatever comes next. The queue advances and a new random piece is added to the back each time you place one.

Pipes only carry water if they connect properly. A straight horizontal pipe only accepts water entering from the left or right; a curve only passes water if it enters the correct open end. Water flowing into a dead end or an unplaced cell causes the game to end immediately.

Plan your route ahead of time. Use cross pieces to change direction when needed. You can place pieces anywhere — including ahead of where the water currently is — to pre-build your route before the water catches up.

Score equals the number of pipe segments successfully flooded.`,
  settings: pipeManiaSettings,
  initialState: (seed: number, settings: PipeManiaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pipe-mania-action"]', pulses: 3 }; },
  component: PipeMania,
};
