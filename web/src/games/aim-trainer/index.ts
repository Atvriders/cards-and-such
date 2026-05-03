import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AimTrainerState, AimTrainerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AimTrainer } from "./AimTrainer.js";

export const aimTrainerSettings = {
  targets: {
    kind: "enum" as const,
    label: "Targets",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type AimTrainerSettingsType = SettingsOf<typeof aimTrainerSettings>;

export const aimTrainerPlugin: GamePlugin<AimTrainerState, AimTrainerAction, typeof aimTrainerSettings> = {
  id: "aim-trainer",
  title: "Aim Trainer",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click targets as they appear. Hit them quickly and accurately. Miss = penalty. Score = speed × accuracy.",
  howToPlay: `Circular targets appear one at a time on the screen. Click the target as quickly and accurately as possible. After each click — hit or miss — a new target spawns immediately.

If you click the target itself, it counts as a hit and your reaction time for that target is recorded. If you click anywhere on the arena that is not the target, it counts as a miss.

Your final score combines the number of hits, your accuracy rate, and your average reaction time. Hitting targets faster gives a higher score multiplier. Missing targets lowers your accuracy and therefore lowers your score.

Difficulty controls the size of the targets. Easy targets are large and forgiving. Medium targets are moderate. Hard targets are small and require precise clicking.

Tips: Rather than following the target with your mouse before clicking, move your cursor toward the area where you expect the next target to appear. Targets spawn at random positions, so develop a quick eye-to-hand reflex rather than deliberate tracking. Keep your movement smooth — jerky corrections are slower than one fluid motion. Warming up on easy mode before switching to hard helps calibrate your motor response.`,
  settings: aimTrainerSettings,
  initialState: (seed: number, settings: AimTrainerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".at-target", pulses: 3 }; },
  component: AimTrainer,
};
