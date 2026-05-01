import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KeyforgeArchonsState, KeyforgeArchonsAction, KeyforgeArchonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KeyforgeArchonsGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const keyforge_archons_plugin: GamePlugin<KeyforgeArchonsState, KeyforgeArchonsAction, typeof settings> = {
  id: "keyforge-archons",
  title: "KeyForge: Archons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Unique-deck card duel — coop variant.",
  howToPlay: "KeyForge: Archons is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KeyforgeArchonsSettings),
  reducer,
  isTerminal,
  component: KeyforgeArchonsGame,
};

export default keyforge_archons_plugin;
