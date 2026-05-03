import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MotoState, MotoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MotorcycleJump } from "./MotorcycleJump.js";

export const motorcycleJumpSettings = {
  ramps: {
    kind: "enum" as const,
    label: "Ramps",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type MotorcycleJumpSettingsType = SettingsOf<typeof motorcycleJumpSettings>;

export const motorcycleJumpPlugin: GamePlugin<MotoState, MotoAction, typeof motorcycleJumpSettings> = {
  id: "motorcycle-jump",
  title: "Motorcycle Jump",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ride your motorcycle and clear every ramp with perfectly timed jumps.",
  howToPlay: `Tear down an open track on your motorcycle and clear a series of ramps by jumping at exactly the right moment. Each ramp has a required height — you must be airborne and at sufficient altitude when you pass over it, or you crash and lose a life.

Press Space or the Up Arrow to jump. The longer you hold your speed, the higher your jump arc. Press the Right Arrow or D to hit the throttle and increase your speed — faster speed means higher jumps but less reaction time.

You start with 3 lives. Clipping a ramp costs one life and resets you behind it. Lose all three and the run ends.

Score is based on ramp height: taller ramps award more points when cleared. Clearing all ramps earns a 200-point completion bonus.

Strategy: Throttle up before wide, tall ramps to get enough air. Ease off the throttle before a tight cluster of shorter ramps to maintain control. Watch the ramp height on approach and launch early enough that your peak altitude clears the top. Later ramps grow significantly taller, so build your speed gradually rather than maxing out early.`,
  settings: motorcycleJumpSettings,
  initialState: (seed: number, settings: MotorcycleJumpSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-motorcycle-jump-action"]', pulses: 3 }; },
  component: MotorcycleJump,
};
