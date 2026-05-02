import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CatapultCastleState, CatapultCastleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CatapultCastle } from "./CatapultCastle.js";

export const catapultCastleSettings = {
  boulders: {
    kind: "enum" as const,
    label: "Boulders",
    options: ["5", "8", "12"] as const,
    default: "8" as const,
  },
} as const;

type CatapultCastleSettingsType = SettingsOf<typeof catapultCastleSettings>;

export const catapultCastlePlugin: GamePlugin<CatapultCastleState, CatapultCastleAction, typeof catapultCastleSettings> = {
  id: "catapult-castle",
  title: "Catapult Castle",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aim your catapult and launch boulders at the castle. Smash blocks for points — can you flatten the walls?",
  howToPlay: `Load up the catapult on the left and bombard the stone castle on the right. Set your angle (10–75°) and power (20–100%) using the sliders, then press LAUNCH to send a boulder arcing through the sky.

The castle is built from stacked stone blocks in multiple floors. Ground-floor blocks score 10–20 points, second-floor blocks score 20–30, and the rooftop blocks are worth the most — especially the turret at the top, worth 50 points. Destroyed blocks crumble away, exposing higher targets.

Physics tip: a low angle with high power sends the boulder on a flat, fast trajectory that hits the base of the castle. A steep angle with moderate power creates a high arc that falls down onto the upper floors and turret. Experiment to find trajectories that thread through gaps in the rubble and hit unreached blocks.

The game ends either when you run out of boulders or when every block has been destroyed. Bonus: demolishing the entire castle is the true victory! Choose 5, 8, or 12 boulders per game.`,
  settings: catapultCastleSettings,
  initialState: (seed: number, settings: CatapultCastleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: () => ({ selector: ".catapult-fire-btn", pulses: 3 }),
  component: CatapultCastle,
};
