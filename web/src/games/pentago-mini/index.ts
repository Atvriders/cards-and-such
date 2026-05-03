import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PentagoMiniState, PentagoMiniAction, PentagoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PentagoMiniGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const pentagoMiniPlugin: GamePlugin<PentagoMiniState, PentagoMiniAction, typeof settings> = {
  id: "pentago-mini",
  title: "Pentago (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tiny Pentago: 4×4 board with four 2×2 quadrants. Place a marble, then rotate any quadrant. Four in a row wins.",
  howToPlay: `Pentago Mini compresses the rotation game to a 4×4 board made of four 2×2 quadrants. Each turn you do two things:

1) Place a marble (Black) on any empty cell.
2) Rotate any of the four quadrants — Top-Left, Top-Right, Bottom-Left, or Bottom-Right — 90° clockwise (↻) or counter-clockwise (↺).

After both steps, the position is checked for any line of four in a row (horizontal, vertical, or diagonal). If both colours complete a line on the same rotation, the game is a draw. Otherwise the player whose colour formed the four-line wins.

Easy bot picks moves at random; Hard bot evaluates the resulting position and prefers immediate wins.

Scoring: win = 100, draw = 50, loss = 0.

Tips: rotations let you both attack and defend at once — a rotation that creates a threat for you may also break the opponent's. Watch all four directions, especially diagonals, after every rotation.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PentagoMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".pentago-rotate-btn", pulses: 3 }; },
  component: PentagoMiniGame,
};
