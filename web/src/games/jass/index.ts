import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JassState, JassAction, JassSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JassGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const jassPlugin: GamePlugin<JassState, JassAction, typeof settings> = {
  id: "jass", title: "Jass", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swiss trick-taking classic with multiple game variants.",
  howToPlay: "Jass is the umbrella name for a family of Swiss trick-taking games played with a thirty-six-card deck. Variants like Schieber, Differenzler, and Coiffeur all share the must-follow/must-trump core and the special role of the trump jack and trump nine as top cards. Each player receives nine cards. The trump suit is chosen by the dealer or by an auction. Tricks are scored according to a fixed point card schedule and the side reaching the target wins. In this six-round duel against the CPU you click Play Round and the engine simulates the deal, trump call, and play. Strategy: announce trump aggressively when your hand contains the jack and nine of one suit; play low-value off-suit cards to unload safely. Aim to win at least three rounds across the match. A score above three hundred is a solid Jass result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JassSettings),
  reducer, isTerminal, component: JassGame,
};
