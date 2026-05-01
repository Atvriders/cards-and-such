import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClankInSpaceState, ClankInSpaceAction, ClankInSpaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClankInSpaceGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const clank_in_space_plugin: GamePlugin<ClankInSpaceState, ClankInSpaceAction, typeof settings> = {
  id: "clank-in-space",
  title: "Clank! In! Space!",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deckbuilding heist on a space station.",
  howToPlay: "Clank! In! Space! is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClankInSpaceSettings),
  reducer,
  isTerminal,
  component: ClankInSpaceGame,
};

export default clank_in_space_plugin;
