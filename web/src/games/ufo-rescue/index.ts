import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UfoState, UfoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UfoRescue } from "./UfoRescue.js";

export const ufoRescueSettings = {
  humans: {
    kind: "enum" as const,
    label: "Humans to rescue",
    options: ["5", "8", "10"] as const,
    default: "8" as const,
  },
} as const;

type UfoRescueSettingsType = SettingsOf<typeof ufoRescueSettings>;

export const ufoRescuePlugin: GamePlugin<UfoState, UfoAction, typeof ufoRescueSettings> = {
  id: "ufo-rescue",
  title: "UFO Rescue",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a UFO and use your tractor beam to rescue stranded humans.",
  howToPlay: `You command a flying saucer on a mission to rescue stranded humans from the surface below. Maneuver your UFO left and right across the night sky, then lower your tractor beam to lift each human safely aboard.

Move with the Left/Right arrow keys or A/D. Toggle the tractor beam on and off with Space or B. When the beam is active, your UFO slowly descends toward the surface. Position the beam directly over a human and hold it there — the beam grabs the human and carries them upward as the UFO rises.

Once the beam is deactivated, the UFO climbs back to altitude. When it reaches full height, any humans on board are counted as rescued and scored at 100 points each.

You can carry multiple humans in one trip. Fly over several people with the beam active before ascending for maximum efficiency. The game ends when all humans are rescued.

Tip: scan the ground from above to locate clusters of humans near each other. A wide sweep with the beam active can net two or three rescues per run, saving time compared to individual pickups. Watch your lateral position carefully when descending — the beam has limited width.`,
  settings: ufoRescueSettings,
  initialState: (seed: number, settings: UfoRescueSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ufo-rescue-action"]', pulses: 3 }; },
  component: UfoRescue,
};
