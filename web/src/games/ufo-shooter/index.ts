import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UfoShooterState, UfoShooterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UfoShooterGame } from "./Game.js";

export const ufoShooterSettings = {
  waves: {
    kind: "enum" as const,
    label: "Waves",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type UfoShooterSettingsType = SettingsOf<typeof ufoShooterSettings>;

export const ufoShooterPlugin: GamePlugin<UfoShooterState, UfoShooterAction, typeof ufoShooterSettings> = {
  id: "ufo-shooter",
  title: "UFO Shooter",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend Earth by shooting UFOs across waves, tracking moving targets with limited shots.",
  howToPlay: `UFO Shooter is a gallery-style arcade game. Waves of alien saucers float across the sky and you must blast them with your ground cannon before they escape.

The battle grid has 10 columns. Your gun starts in column 5. Each wave spawns UFOs at random positions — early waves spawn 3 UFOs while later waves spawn up to 7. You have 10 shots per wave.

Use Left and Right to move your gun to the target column. Press Shoot to fire. If a UFO is in your column it takes a hit. UFOs with 1 HP are destroyed for 100 points. Tougher UFOs (which appear from wave 3 onward) require 2 hits — the first hit earns 40 points and the second earns 100.

UFOs move after every shot — they drift left or right randomly, so you need to lead your aim. Watch carefully and anticipate where a moving UFO will be after you reposition.

When all UFOs in a wave are destroyed or you run out of shots, press Next Wave. The game ends after all waves are complete. Escaped UFOs earn no penalty but waste your shot budget.

Score is capped at 1000. To maximise your score, track moving targets closely and prioritise low-HP UFOs first.`,
  settings: ufoShooterSettings,
  initialState: (seed: number, settings: UfoShooterSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: UfoShooterState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-ufo-shooter-action"]', pulses: 3 };
    },
  component: UfoShooterGame,
};
