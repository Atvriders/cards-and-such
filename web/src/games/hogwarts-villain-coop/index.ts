import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsVillainCoopState, HogwartsVillainCoopAction, HogwartsVillainCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HogwartsVillainCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hogwarts_villain_coop_plugin: GamePlugin<HogwartsVillainCoopState, HogwartsVillainCoopAction, typeof settings> = {
  id: "hogwarts-villain-coop",
  title: "Hogwarts Battle: Villains",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Villain-only deck Hogwarts Battle variant.",
  howToPlay: "Hogwarts Battle: Villains is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsVillainCoopSettings),
  reducer,
  isTerminal,
  component: HogwartsVillainCoopGame,
};

export default hogwarts_villain_coop_plugin;
