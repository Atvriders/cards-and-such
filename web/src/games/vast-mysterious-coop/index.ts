import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { VastMysteriousCoopState, VastMysteriousCoopAction, VastMysteriousCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VastMysteriousCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const vast_mysterious_coop_plugin: GamePlugin<VastMysteriousCoopState, VastMysteriousCoopAction, typeof settings> = {
  id: "vast-mysterious-coop",
  title: "Vast: Mysterious Manor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric coop variant of Vast.",
  howToPlay: "Vast: Mysterious Manor is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as VastMysteriousCoopSettings),
  reducer,
  isTerminal,
  component: VastMysteriousCoopGame,
};

export default vast_mysterious_coop_plugin;
