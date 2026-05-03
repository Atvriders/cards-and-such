import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArcheryTargetState, ArcheryTargetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArcheryTarget } from "./ArcheryTarget.js";

export const archeryTargetSettings = {
  arrows: {
    kind: "enum" as const,
    label: "Arrows",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type ArcheryTargetSettingsType = SettingsOf<typeof archeryTargetSettings>;

export const archeryTargetPlugin: GamePlugin<ArcheryTargetState, ArcheryTargetAction, typeof archeryTargetSettings> = {
  id: "archery-target",
  title: "Archery Target",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw your bow and release at the perfect moment to score a bull's-eye. Wind complicates every shot.",
  howToPlay: `Step to the archery line and aim at a classic ten-ring target. Press and hold the fire button (or touch the canvas) to draw your bow. As you draw, the crosshair wobbles — this represents muscle tension and natural sway, which increases with draw time. Release at the right moment to send the arrow flying.

Wind blows from a random direction each shot, indicated by the blue arrow in the corner. High draw power reduces the effect of wind drift slightly, because a faster arrow is deflected less. Balance your draw: releasing too early means low power and a wide scatter pattern; holding too long increases wobble and makes precise aim harder.

Scoring follows Olympic archery: the bull's-eye (innermost yellow) is worth 10 points, with each ring out scoring one less, down to 1 for the outermost white ring. Arrows outside all rings score 0.

Choose 5, 10, or 15 arrows per game. Maximum possible score equals arrows × 10. Study the wind arrow carefully, lead your aim into the wind, and time your release during the crosshair's steadiest phase for the best scores.`,
  settings: archeryTargetSettings,
  initialState: (seed: number, settings: ArcheryTargetSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".archery-canvas", pulses: 3 }; },
  component: ArcheryTarget,
};
