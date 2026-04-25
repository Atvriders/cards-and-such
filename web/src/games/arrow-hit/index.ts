import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArrowHitState, ArrowHitAction, ArrowHitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArrowHit } from "./Game.js";

const arrowHitSettings = {
  arrows: { kind: "enum" as const, label: "Arrows", options: ["5", "10"] as const, default: "5" as const },
} as const;

type ArrowHitSettingsType = SettingsOf<typeof arrowHitSettings>;

export const arrowHitPlugin: GamePlugin<ArrowHitState, ArrowHitAction, typeof arrowHitSettings> = {
  id: "arrow-hit",
  title: "Arrow Hit",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A marker slides back and forth across the target. Hit SHOOT at the perfect moment to land a bullseye!",
  howToPlay: `Arrow Hit is a timing arcade game. A red indicator slides back and forth across a horizontal target bar at varying speeds. Your goal is to press SHOOT at the exact right moment.

The target bar has three zones: the outer edges score 0 points (miss), the middle blue region scores 50 points (hit), and the small red center zone scores 100 points (bullseye). The zones are visible so you can time your shot.

Press SHOOT when the indicator is in the zone you want. After shooting, the result is shown and you press Next Arrow to try again. The speed changes with each arrow — stay sharp!

You have 5 or 10 arrows per game (choose in Settings). Each bullseye scores 100, a regular hit scores 50, and a miss scores 0. Maximum score is 1,000 with 10 perfect bullseyes.

The faster the indicator moves, the harder it is to land a bullseye. React quickly and time your shot to perfection!`,
  settings: arrowHitSettings,
  initialState: (seed: number, settings: ArrowHitSettingsType) => initialState(seed, settings as ArrowHitSettings),
  reducer,
  isTerminal,
  component: ArrowHit,
};
