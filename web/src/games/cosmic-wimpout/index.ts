import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CosmicWimpoutState, CosmicWimpoutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CosmicWimpout } from "./CosmicWimpout.js";

export const cosmicWimpoutSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["100", "200", "500"] as const,
    default: "200",
  },
} as const;

type CosmicWimpoutSettingsType = SettingsOf<typeof cosmicWimpoutSettings>;

export const cosmicWimpoutPlugin: GamePlugin<CosmicWimpoutState, CosmicWimpoutAction, typeof cosmicWimpoutSettings> = {
  id: "cosmic-wimpout",
  title: "Cosmic Wimpout",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice, keep scoring ones, bank points — but wimpout and lose it all!",
  howToPlay: `Cosmic Wimpout is a fast-paced push-your-luck dice game. Roll 5 dice and identify scoring combinations, then decide to keep rolling or bank your points.

Scoring: a single 1 = 10 points, a single 5 = 5 points. Three of a kind scores the face value times 10 (three 2s = 20, three 6s = 60), except three 1s = 100. Four of a kind doubles the triplet score; five of a kind doubles again.

On your turn click "Roll 5 Dice". After rolling, click any die showing a scoring value (1 or 5 alone, or any die contributing to three-of-a-kind) to keep it. Kept dice count toward your turn score. Then click "Roll Again" to continue rolling the unkept dice, or "Bank" to add your turn score to your running total.

The danger: if a re-roll produces no scoring dice at all, that is a Wimpout! You lose your entire turn score and must click "Next Turn" to continue.

Hot dice: if you keep all 5 dice, you can roll all 5 again for free, carrying forward your accumulated score. Reach the target to win!`,
  settings: cosmicWimpoutSettings,
  initialState: (seed: number, settings: CosmicWimpoutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CosmicWimpout,
};
