import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VolcanoEscapeState, VolcanoEscapeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VolcanoEscape } from "./VolcanoEscape.js";

export const volcanoEscapeSettings = {
  speed: {
    kind: "enum" as const,
    label: "Lava Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type VolcanoEscapeSettingsType = SettingsOf<typeof volcanoEscapeSettings>;

export const volcanoEscapePlugin: GamePlugin<VolcanoEscapeState, VolcanoEscapeAction, typeof volcanoEscapeSettings> = {
  id: "volcano-escape",
  title: "Volcano Escape",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dodge descending lava blobs and reach the exit at the top of the grid.",
  howToPlay: `Volcano Escape is an arcade game where you play a frantic runner (🏃) trying to escape a volcanic eruption. Lava blobs (🌋) cascade down the 7×8 grid and you must dodge them, moving upward to reach the exit door (🚪) at the top row.

The board starts with several lava blobs at the top. Each time you press the Advance Lava button, all existing blobs move one row downward and may drift slightly left or right. New lava may also spawn at the top. You must reach the top-row exit before lava traps you.

Use the arrow buttons to move your runner one cell at a time — up, down, left, or right. If you step onto a lava cell, or if lava moves onto your cell after an Advance, the game ends.

On Slow, only two lava blobs start and new blobs spawn infrequently. Normal starts with three blobs. Fast begins with four and adds new blobs more often.

Scoring: escaping scores 500 base points plus 10 per tick survived. Being caught by lava scores 10 per tick. Score is capped at 1000.

Strategy: keep moving upward and avoid getting cornered. Lava drifts left and right unpredictably, so leave yourself sideways escape routes. Never stop moving — standing still is a sure way to get hit as lava accumulates. Watch the top row carefully before each Advance to anticipate spawn positions.`,
  settings: volcanoEscapeSettings,
  initialState: (seed: number, settings: VolcanoEscapeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-volcano-escape-action"]', pulses: 3 }; },
  component: VolcanoEscape,
};
