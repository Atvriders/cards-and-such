import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YajilinState, YajilinAction, YajilinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Yajilin } from "./Yajilin.js";

export const yajilinSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type YajilinSettingsType = SettingsOf<typeof yajilinSettings>;

export const yajilinPlugin: GamePlugin<YajilinState, YajilinAction, typeof yajilinSettings> = {
  id: "yajilin",
  title: "Yajilin",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a closed loop and shade cells to satisfy arrow-count clues.",
  howToPlay: `Yajilin is a Japanese loop puzzle. The grid contains grey arrow-clue cells showing a direction and a number. That number tells you how many shaded cells lie in that direction from the clue cell (in a straight line to the edge). Clue cells themselves are neither shaded nor part of the loop.

Your two tasks: first, shade the correct non-clue cells to satisfy every arrow count; second, draw a single closed loop that passes through every non-clue, non-shaded cell exactly once. The loop may only travel horizontally or vertically between adjacent cells.

Click a white cell to cycle through three states: empty → loop (○) → shaded (■) → empty. Mark loop cells where the path travels and shade cells that are counted by arrows. No two shaded cells may be adjacent to each other.

Winning condition: every clue's count matches the shaded cells in its direction, every non-clue non-shaded cell is on the loop, and the loop forms one connected closed circuit with no branches.

Strategy: start with clues whose count is 0 (no shaded cells in that direction) to immediately constrain large areas. Then identify forced loop segments near corners and edges. The loop and shading constraints interact — solving one helps the other.`,
  settings: yajilinSettings,
  initialState: (seed: number, settings: YajilinSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-yajilin-action"]', pulses: 3 }; },
  component: Yajilin,
};
