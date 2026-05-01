import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndMagesState, AeonsEndMagesAction, AeonsEndMagesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndMagesGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const aeons_end_mages_plugin: GamePlugin<AeonsEndMagesState, AeonsEndMagesAction, typeof settings> = {
  id: "aeons-end-mages",
  title: "Aeon's End: Mages",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spell-slinging mages defend Gravehold from the Nameless.",
  howToPlay: "Aeon's End: Mages is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndMagesSettings),
  reducer,
  isTerminal,
  component: AeonsEndMagesGame,
};

export default aeons_end_mages_plugin;
