import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Trek12JungleState, Trek12JungleAction, Trek12JungleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Trek12JungleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trek12JunglePlugin: GamePlugin<Trek12JungleState, Trek12JungleAction, typeof settings> = {
  id: "trek-12-jungle",
  title: "Trek 12: Jungle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jungle map roll-and-write; dice drive expedition through canopy.",
  howToPlay: "Trek 12: Jungle is a Trek 12 variant set in a tropical canopy. Roll two-die-style results, choose an operation, and place results on a jungle hex map (here a 4x4 grid).\n\nEach round, click Roll to generate a result (1-6). Click any empty cell to record that result as an expedition step. Skip if you would rather wait for a higher roll.\n\nScoring:\n- Each placed cell scores its die value (1-6).\n- +5 per row (canopy traverse complete).\n- +5 per column (river drainage explored).\n- +10 for fully mapped jungle (expedition triumph).\n\n12 rolls available. Jungle Trek's tight canopy means that placement matters more than raw value: a 3 in a key intersection can trigger both row and column bonuses simultaneously. A typical run scores 35-55; mastering pathfinding reaches 65+. Trek 12: Jungle is perfect for fans of tense decision-making over chains of rolls. Each die is a clearing in the dense forest — find the right one.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Trek12JungleSettings),
  reducer,
  isTerminal,
  component: Trek12JungleGame,
};
