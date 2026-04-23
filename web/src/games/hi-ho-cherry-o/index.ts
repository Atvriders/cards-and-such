import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HiHoState, HiHoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HiHoGame } from "./Game.js";

export const hiHoSettings = {
  dummy: {
    kind: "enum" as const,
    label: "Players",
    options: ["yes"] as const,
    default: "yes" as const,
  },
} as const;

type HiHoSettingsType = SettingsOf<typeof hiHoSettings>;

export const hiHoCherryOPlugin: GamePlugin<HiHoState, HiHoAction, typeof hiHoSettings> = {
  id: "hi-ho-cherry-o",
  title: "Hi Ho! Cherry-O",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin to pick cherries from your tree. First to empty the tree wins!",
  howToPlay: `Hi Ho! Cherry-O is a classic luck game for young children. You play against three bots, each starting with 10 cherries hanging on their tree. Your goal is to be the first to move all 10 cherries from your tree into your bucket.

On your turn, click "Spin" to spin the spinner. The spinner has seven faces: Pick 1, Pick 2, Pick 3, or Pick 4 cherries from your tree into your bucket; Spill the bucket (all your bucket cherries go back to the tree — oh no!); Bird (a bird steals 2 cherries from your bucket back to the tree); or Dog (same as bird — your dog eats 2 cherries from your bucket).

After you spin, the three bots automatically take their turns. Watch the cherry counts carefully!

The key tension: the spill, bird, and dog results can undo your progress dramatically. Even if you are almost done, one bad spin can send you back to the start.

First player whose tree reaches zero cherries wins! The score is 100 for a win and 0 for a loss. This is a pure luck game, great for the youngest players. Good luck spinning!`,
  settings: hiHoSettings,
  initialState: (seed: number, settings: HiHoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HiHoGame,
};
