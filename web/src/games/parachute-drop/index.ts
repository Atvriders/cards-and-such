import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParachuteDropState, ParachuteDropAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ParachuteDrop } from "./ParachuteDrop.js";

export const parachuteDropSettings = {
  wind: {
    kind: "enum" as const,
    label: "Wind",
    options: ["none", "light", "strong"] as const,
    default: "light" as const,
  },
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5", "7"] as const,
    default: "3" as const,
  },
} as const;

type ParachuteDropSettingsType = SettingsOf<typeof parachuteDropSettings>;

export const parachuteDropPlugin: GamePlugin<ParachuteDropState, ParachuteDropAction, typeof parachuteDropSettings> = {
  id: "parachute-drop",
  title: "Parachute Drop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guide skydivers onto the landing zone before they hit the ground outside it.",
  howToPlay: `Parachutists fall from the sky and you must position the landing zone to catch them. Move the yellow landing pad left and right so each parachutist lands inside it.

Move your mouse (or drag on touch screens) across the play area to slide the landing zone. Each parachutist who lands inside scores one point. Each one who misses costs you a life. Lose all lives and the game ends.

Wind can push parachutists sideways as they fall. With no wind they drop straight down and are easy to predict. Light wind causes gentle drifting that you can compensate for. Strong wind creates large sideways drifts that require constant tracking and repositioning of the pad.

Multiple parachutists can be in the air at the same time. Prioritize the one closest to the ground — it is better to let a high one drift a little while you position for the imminent landing than to chase one at the top while someone hits the ground below.

Choose 3, 5, or 7 starting lives. More lives means you can afford a few misses, making the game easier to learn. Tips: Keep the landing zone slightly ahead of the parachutist's drift direction rather than directly below them.`,
  settings: parachuteDropSettings,
  initialState: (seed: number, settings: ParachuteDropSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ParachuteDrop,
};
