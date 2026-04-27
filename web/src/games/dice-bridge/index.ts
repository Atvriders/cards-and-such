import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBridgeState, DiceBridgeAction, DiceBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBridgeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBridgePlugin: GamePlugin<DiceBridgeState, DiceBridgeAction, typeof settings> = {
  id: "dice-bridge", title: "Dice Bridge", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a 6-segment bridge with valid dice rolls. 12 rolls.",
  howToPlay: `Dice Bridge is a press-your-luck dice game. You're trying to build a 6-segment bridge by rolling two dice. Each roll either adds a segment or doesn't, depending on the sum: a sum of 7 through 12 is "valid" and adds one segment to your bridge. Anything from 2 to 6 is invalid — the segment fails to set, and the roll counts against your budget without progress.

You have a budget of 12 rolls. Each segment is worth 30 points; completing all 6 segments awards a 50-point bonus on top, for a maximum theoretical score of 230 points (180 + 50).

The probability of any two-die sum being 7-12 is 21/36 ≈ 58.3%. So the math says you'll average about 7 valid rolls in 12 attempts — comfortably more than the 6 you need, but with high variance.

You can press Bank at any time to lock in your current bridge progress and end the game. There's no penalty for banking early; it's strategy. If you've got 6 segments and 4 rolls left, banking is fine — you've already won.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBridgeSettings),
  reducer, isTerminal, component: DiceBridgeGame,
};
