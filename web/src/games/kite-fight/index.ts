import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KiteFightState, KiteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KiteFight } from "./Game.js";

export const kiteFightPlugin = {
  id: "kite-fight",
  title: "Kite Fight",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Maneuver your kite on a 9×9 grid to cut opponents' strings. Read the wind direction and outposition rivals before their lines fray!",
  howToPlay: `Kite Fight is a strategic aerial combat game played on a 9×9 grid. You control a red kite; three opponent kites drift around the sky. Your goal: cut their strings before the 15 rounds are up.

Each round, move your kite using the directional arrows. You can shift one cell in any of the four cardinal directions. Once you're in position, press OK to confirm your move and end the round.

After you move, the wind blows opponent kites one cell in the current wind direction, and their string lengths shorten by 2 each round. Opponents whose strings reach zero crash and are eliminated.

Cut an opponent by moving your kite to the same cell — their string is sliced immediately. Kites in adjacent cells with strings below 30 are also at risk of being cut.

Wind direction changes every round and is displayed at the top. Use the wind to your advantage: anticipate where opponents will drift and position yourself accordingly.

Score 30 points per cut and a 100-point bonus for eliminating all opponents. String-weakened kites are easier to cut — prioritize ones with low string values. Finish all opponents quickly for the highest score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: KiteFightState, action: KiteAction) => KiteFightState,
  isTerminal,
  component: KiteFight,
} as unknown as GamePlugin;
