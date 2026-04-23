import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PaddleBallState, PaddleBallAction, PaddleBallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaddleBallJuggleGame } from "./Game.js";

export const paddleBallSettings = {} as const;

export const paddleBallPlugin: GamePlugin<
  PaddleBallState,
  PaddleBallAction,
  typeof paddleBallSettings
> = {
  id: "paddle-ball-juggle",
  title: "Paddle Ball Juggle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Keep multiple balls bouncing with your paddle. Catch power-ups. Survive!",
  howToPlay: `Control a horizontal paddle at the bottom of the screen and keep balls bouncing without letting them fall off. Each bounce scores a point. You start with one ball and 3 lives — a life is lost each time a ball drops past the paddle.

Move the paddle by moving your mouse over the game canvas or dragging on touch screens. On keyboards, use the Left and Right arrow keys to nudge the paddle side to side.

Colored power-up capsules occasionally fall from the top of the screen. Catch them with your paddle for bonus effects: the green "W+" capsule widens your paddle temporarily; the pink "+B" capsule spawns an extra ball; the blue "SLO" capsule slows all balls down briefly, giving you more reaction time.

As more balls are in play simultaneously, the challenge multiplies — you need to track all of them at once and position your paddle to catch the lowest one first.

Score points for every paddle bounce plus 5 bonus points per power-up caught. The game ends when all lives are exhausted (each dropped ball costs one life). Can you juggle four or five balls at once?`,
  settings: paddleBallSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PaddleBallJuggleGame,
};
