import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, SentinelsMultiverseCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SentinelsMultiverseCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sentinelsMultiverseCoopPlugin: GamePlugin<SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, typeof settings> = {
  id: "sentinels-multiverse-coop",
  title: "Sentinels of the Multiverse",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Comic-book heroes defeat villains in the Multiverse.",
  howToPlay: "Sentinels of the Multiverse is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsMultiverseCoopSettings),
  reducer,
  isTerminal,
  component: SentinelsMultiverseCoopGame,
};

export default sentinelsMultiverseCoopPlugin;
