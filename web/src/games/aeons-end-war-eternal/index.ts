import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndWarEternalState, AeonsEndWarEternalAction, AeonsEndWarEternalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndWarEternalGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeons_end_war_eternal_plugin: GamePlugin<AeonsEndWarEternalState, AeonsEndWarEternalAction, typeof settings> = {
  id: "aeons-end-war-eternal",
  title: "Aeon's End: War Eternal",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stand-alone Aeon's End with new mages.",
  howToPlay: "Aeon's End: War Eternal is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndWarEternalSettings),
  reducer,
  isTerminal,
  component: AeonsEndWarEternalGame,
};

export default aeons_end_war_eternal_plugin;
