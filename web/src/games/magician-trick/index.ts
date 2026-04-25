import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicianTrickState, MagicianTrickAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicianTrick } from "./MagicianTrick.js";

export const magicianTrickSettings = {
  cups: {
    kind: "enum" as const,
    label: "Cups",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
} as const;

type MagicianTrickSettingsType = SettingsOf<typeof magicianTrickSettings>;

export const magicianTrickPlugin: GamePlugin<MagicianTrickState, MagicianTrickAction, typeof magicianTrickSettings> = {
  id: "magician-trick",
  title: "Magician Trick",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the magician shuffle cups and guess which one hides the ball.",
  howToPlay: `Magician Trick is a classic shell game. The magician places a ball under one of the cups and shuffles them. Your job is to track the ball through the shuffles and identify the correct cup at the end.

Each round has three phases. In the Reveal phase, the ball (⚽) is shown under one of the hats (🎩). Study which cup holds it, then press Start Shuffle. During the Shuffle phase, press Next Swap repeatedly to advance through each cup exchange. Pay close attention — two cups swap positions with each click and the ball travels with its cup. Finally, in the Guess phase, click the cup you think hides the ball.

After your guess, the ball's true location is revealed. You earn points for a correct guess. Press Next Round to continue or let the score accumulate over all five rounds.

The game lasts five rounds. Choosing 3 cups is easiest, 4 is moderate, and 5 cups with more swaps is the hardest challenge. With 3 cups there are 6 swaps per round; with 5 cups there are 8.

Scoring: each correct guess earns 200 points. Perfect play (5 for 5) scores 1000. Score is capped at 1000.

Tips: instead of tracking the ball directly, track the cup position using its relative location on screen. After each swap, mentally note "the ball is now second from left" rather than trying to follow the motion. Slow down and advance one swap at a time.`,
  settings: magicianTrickSettings,
  initialState: (seed: number, settings: MagicianTrickSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MagicianTrick,
};
