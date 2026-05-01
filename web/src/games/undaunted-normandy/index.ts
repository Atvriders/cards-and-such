import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { UndauntedNormandyState, UndauntedNormandyAction, UndauntedNormandySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UndauntedNormandyGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const undaunted_normandy_plugin: GamePlugin<UndauntedNormandyState, UndauntedNormandyAction, typeof settings> = {
  id: "undaunted-normandy",
  title: "Undaunted: Normandy",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "WWII deckbuilding tactics.",
  howToPlay: "Undaunted: Normandy is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UndauntedNormandySettings),
  reducer,
  isTerminal,
  component: UndauntedNormandyGame,
};

export default undaunted_normandy_plugin;
