import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { QJumpState, QJumpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QJump } from "./QJump.js";

export const qJumpPlugin: GamePlugin<QJumpState, QJumpAction, Record<never, never>> = {
  id: "qbert-like",
  title: "Q-Jump",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hop across an isometric pyramid, coloring every cube while dodging foes.",
  howToPlay: `Navigate your character across a 7-row isometric pyramid of cubes. Your goal is to change the color of every cube by landing on it at least once.

Movement is diagonal: press Q or the Up arrow to jump upper-left, S or Down to jump upper-right, Z or Left to jump lower-left, X or Right to jump lower-right. You can also use the on-screen arrow buttons. Each successful new landing turns that cube from brown to orange and earns 25 points.

Three enemy balls start at the top and wander randomly down the pyramid. If an enemy occupies the same cube as you, you lose a life and are reset to the top cube. You start with three lives. Jumping off the edge of the pyramid also costs a life.

Color every cube on the pyramid to win. Remaining lives grant a 200-point bonus each. Time your moves around enemy positions — enemies can be partially predicted because they follow the same diagonal movement rules you do, though they choose directions randomly.

Tips: Work methodically row by row. Watch where enemies are heading before making your jump. If cornered by two enemies, jumping off the edge to reset position is sometimes safer than taking a collision hit.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: QJump,
};
