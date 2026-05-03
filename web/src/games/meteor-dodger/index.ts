import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MeteorDodgerState, MeteorDodgerAction, MeteorDodgerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MeteorDodgerGame } from "./Game.js";

export const meteorDodgerSettings = {} as const;

export const meteorDodgerPlugin: GamePlugin<
  MeteorDodgerState,
  MeteorDodgerAction,
  typeof meteorDodgerSettings
> = {
  id: "meteor-dodger",
  title: "Meteor Dodger",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a ship through a meteor shower. Survive as long as possible.",
  howToPlay: `Pilot a small triangular spaceship through a continuous meteor shower. Meteors fall from the top of the screen in varying sizes and speeds. Your goal is to survive as long as possible — time in seconds is your score.

Move the ship in all 8 directions using the arrow keys or WASD. On touch screens, use the on-screen directional buttons. Moving diagonally is slightly slower than moving in a cardinal direction (realistic diagonal scaling).

Meteors vary in size — larger meteors are easier to see but harder to dodge because they occupy more space. Smaller meteors are trickier because they appear with less warning. The spawn rate increases over time, making early survival easy but later play increasingly frantic.

Stay away from the top of the screen where meteors first appear — you have less reaction time there. The middle and lower regions give you more room to maneuver. Keep moving; a stationary ship will eventually be hit.

There are no weapons. You cannot destroy meteors — only dodge them. Every collision ends the run. Challenge yourself to beat your previous best survival time.`,
  settings: meteorDodgerSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: MeteorDodgerState): HintTarget | null => (!state.over ? { selector: ".arcade-btn", pulses: 3 } : null), component: MeteorDodgerGame,
};
