import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanabiExtraCoopState, HanabiExtraCoopAction, HanabiExtraCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanabiExtraCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hanabi_extra_coop_plugin: GamePlugin<HanabiExtraCoopState, HanabiExtraCoopAction, typeof settings> = {
  id: "hanabi-extra-coop",
  title: "Hanabi: Extra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hanabi with extra suits.",
  howToPlay: "Hanabi: Extra is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanabiExtraCoopSettings),
  reducer,
  isTerminal,
  component: HanabiExtraCoopGame,
};

export default hanabi_extra_coop_plugin;
