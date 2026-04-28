import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RingTheBullState, RingTheBullAction, RingTheBullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RingTheBullGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ringTheBullPlugin: GamePlugin<RingTheBullState, RingTheBullAction, typeof settings> = {
  id: "ring-the-bull-toss",
  title: "Ring the Bull",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swing bull-ring to hook on bull's nose. Tavern dexterity classic.",
  howToPlay: "Ring the Bull is a centuries-old British pub game where a metal ring on a chain is swung at the nose-hook of a small mounted bull's-head. A successful catch is rare and prized; near-misses are common. In this digital adaptation, each turn you press Swing and a precision-roll determines the result: 5% perfect hook (20 points), descending tiers to a complete miss (0 points). Across ten swings, the typical total is 60-90 with great runs above 130. Press Next after each swing to advance. The original pub game is one of the oldest in England, recorded in taverns since the 1600s, and was played by sailors waiting between pints. The arc of a swinging ring on chain is intensely satisfying when it lands. The digital version preserves the slow swinging rhythm with each press serving as one full pendulum-and-release cycle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RingTheBullSettings),
  reducer,
  isTerminal,
  component: RingTheBullGame,
};
