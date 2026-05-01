import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsBattleCoopState, HogwartsBattleCoopAction, HogwartsBattleCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HogwartsBattleCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hogwarts_battle_coop_plugin: GamePlugin<HogwartsBattleCoopState, HogwartsBattleCoopAction, typeof settings> = {
  id: "hogwarts-battle-coop",
  title: "Harry Potter: Hogwarts Battle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend Hogwarts from villain takeovers.",
  howToPlay: "Harry Potter: Hogwarts Battle is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsBattleCoopSettings),
  reducer,
  isTerminal,
  component: HogwartsBattleCoopGame,
};

export default hogwarts_battle_coop_plugin;
