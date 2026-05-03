import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CastleWallState, CastleWallAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CastleWall } from "./CastleWall.js";

const castleWallSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof castleWallSettings>;

export const castleWallPlugin: GamePlugin<CastleWallState, CastleWallAction, typeof castleWallSettings> = {
  id: "castle-wall",
  title: "Castle Wall",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a single closed loop; black clues say how many sides the loop passes, white clues must be inside.",
  howToPlay: `Castle Wall is a loop-drawing puzzle. Your goal is to draw a single, closed, non-self-intersecting loop along the grid lines connecting the dots. The loop must satisfy all clue constraints.

Two types of clues appear: black cells and white cells. A black cell must be outside the loop. Its number (if present) tells you exactly how many of its four sides are used by the loop — so a black "2" means the loop runs along exactly two edges of that cell. A white cell must be inside the loop or have the loop pass through it.

Click near the midpoint of any edge between two adjacent dots to toggle that edge on or off. The loop turns blue when drawn, and turns green when the puzzle is complete.

Strategy: cells with a count of 0 mean the loop avoids them entirely. Cells with a count equal to their maximum reachable sides force the loop past every available side. Black corners have at most two reachable sides. Use these extremes as starting anchors, then use connectivity (a valid loop must connect smoothly) to fill in the rest.

Click Reset to erase your current attempt.`,
  settings: castleWallSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-castle-wall-action"]', pulses: 3 }; },
  component: CastleWall,
};
