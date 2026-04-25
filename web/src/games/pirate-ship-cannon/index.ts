import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PirateShipCannonState, PirateShipCannonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PirateShipCannonGame } from "./Game.js";

export const pirateShipCannonSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "8"] as const,
    default: "5" as const,
  },
} as const;

type PirateShipCannonSettingsType = SettingsOf<typeof pirateShipCannonSettings>;

export const pirateShipCannonPlugin: GamePlugin<PirateShipCannonState, PirateShipCannonAction, typeof pirateShipCannonSettings> = {
  id: "pirate-ship-cannon",
  title: "Pirate Ship Cannon",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aim your pirate cannon by adjusting power and angle to sink enemy ships across the waves.",
  howToPlay: `Pirate Ship Cannon puts you on the deck of a pirate vessel. Enemy ships sail across the horizon and your job is to blast them with cannon fire.

Each round, an enemy ship appears at a random distance (10–100 units) and horizontal position (−5 to +5). You control two parameters — Power (ranges 10 to 100, in steps of 5) and Angle (−5 to +5, in steps of 1). Power determines how far your cannonball travels. Angle determines the horizontal trajectory.

To score well, match your Power to the enemy's distance and your Angle to its position. Use Power+ and Power− to adjust range. Use Aim Left and Aim Right to steer.

Shot results: Direct Hit (power within 5 of distance, angle exact) earns 150 points. Close Hit (power within 10, angle within 1) earns 80 points. Splash (power within 20, angle within 2) earns 30 points. Miss earns nothing.

After each shot the enemy ship moves — it drifts closer each round and shifts horizontally. Watch the enemy info panel to track movement before the next round.

Play 5 or 8 rounds. Score is capped at 1000. Aim for Direct Hits every round for the highest total.`,
  settings: pirateShipCannonSettings,
  initialState: (seed: number, settings: PirateShipCannonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PirateShipCannonGame,
};
