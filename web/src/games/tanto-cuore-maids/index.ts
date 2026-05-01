import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TantoCuoreMaidsState, TantoCuoreMaidsAction, TantoCuoreMaidsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TantoCuoreMaidsGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tanto_cuore_maids_plugin: GamePlugin<TantoCuoreMaidsState, TantoCuoreMaidsAction, typeof settings> = {
  id: "tanto-cuore-maids",
  title: "Tanto Cuore: Maids",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Maid-themed deck-builder.",
  howToPlay: "Tanto Cuore: Maids is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TantoCuoreMaidsSettings),
  reducer,
  isTerminal,
  component: TantoCuoreMaidsGame,
};

export default tanto_cuore_maids_plugin;
