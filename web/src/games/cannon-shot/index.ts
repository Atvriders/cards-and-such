import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CannonShotState, CannonShotAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CannonShot } from "./CannonShot.js";

export const cannonShotSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7" as const,
  },
} as const;

type CannonShotSettingsType = SettingsOf<typeof cannonShotSettings>;

export const cannonShotPlugin: GamePlugin<CannonShotState, CannonShotAction, typeof cannonShotSettings> = {
  id: "cannon-shot",
  title: "Cannon Shot",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aim your cannon and blast a cannonball at the target. Adjust angle and power to score bull's-eyes.",
  howToPlay: `Load the cannon, set your angle and power, and fire a cannonball at the circular target on the right side of the screen. The cannonball follows a realistic arc — gravity curves it downward and air drag slows it over distance, so long shots require more power and a steeper angle.

Use the Angle slider to tilt the barrel from 5° to 85°. Higher angles create a tall arc that drops steeply; lower angles send the ball on a flatter, faster trajectory. Use the Power slider (10%–100%) to control launch speed — low power barely clears the cannon, full power sends the ball screaming across the field.

Scoring rewards accuracy: hitting the outermost ring gives 50 points, while a near-perfect bull's-eye can earn close to 100. The target relocates each round, so you must re-aim every shot.

Each game has 5, 7, or 10 rounds. Observe where your shot lands relative to the target and adjust accordingly — a miss that goes long means reduce power or steepen the angle; a shot that falls short means add power or flatten. Master the interplay of angle and power to consistently hit the red rings.`,
  settings: cannonShotSettings,
  initialState: (seed: number, settings: CannonShotSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-cannon-shot-action"]', pulses: 3 }; },
  component: CannonShot,
};
