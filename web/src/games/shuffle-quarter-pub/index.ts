import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShuffleQuarterState, ShuffleQuarterAction, ShuffleQuarterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShuffleQuarterGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const shuffleQuarterPlugin: GamePlugin<ShuffleQuarterState, ShuffleQuarterAction, typeof settings> = {
  id: "shuffle-quarter-pub",
  title: "Shuffle Quarter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide quarter off bar edge. Land overhanging the far edge to score.",
  howToPlay: "Shuffle Quarter is a finger-shuffleboard pub game where you slide a quarter across the bar and try to land it just overhanging the far edge, closer the better. Sliding too far and the coin falls off; too short and you miss the scoring zone. In this digital adaptation, each turn you press Slide and a precision-roll determines your result: 5% perfect overhang (20 points), descending tiers to a clean miss (0 points). Across ten turns, the typical total is 60-90 with great runs above 130. Press Next after each slide. The classic in-bar version has players betting drinks on the result; here you're competing against your own high score. The trick of the original is balancing finger pressure with surface friction, too much wax and the coin overshoots, too dry and it stops short. The digital version captures the same satisfying luck-driven rhythm.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShuffleQuarterSettings),
  reducer,
  isTerminal,
  component: ShuffleQuarterGame,
};
