import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HelicopterState, HelicopterAction, HelicopterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HelicopterGame } from "./Game.js";

export const helicopterSettings = {} as const;

export const helicopterPlugin: GamePlugin<
  HelicopterState,
  HelicopterAction,
  typeof helicopterSettings
> = {
  id: "helicopter-game",
  title: "Helicopter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hold to rise, release to fall. Fly through the cave without hitting the walls.",
  howToPlay: `Pilot a helicopter through an endless cave filled with wall obstacles. The helicopter constantly falls due to gravity. Your only control is thrust: hold the button to climb, release it to descend.

Hold Space, the Up arrow key, press and hold the canvas, or press the on-screen button to activate thrust and rise. Release to let gravity pull the helicopter back down.

Walls slide in from the right with gaps you must navigate through. The top and bottom sections of each wall are randomly sized, creating varying gap positions and heights. You must keep the helicopter within the gap — touching any wall or the cave ceiling or floor ends the game.

The key skill is reading the next gap early enough to position yourself correctly. Because the helicopter has momentum, you cannot snap instantly to a new height — you must anticipate and start adjusting in advance.

Score is distance traveled in meters. There is no speed increase, so the only challenge is your ability to read and react to the incoming wall patterns. Stay near the center of the cave when no wall is visible to give yourself the most room to maneuver.`,
  settings: helicopterSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HelicopterGame,
};
