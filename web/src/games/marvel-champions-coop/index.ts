import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelChampionsCoopState, MarvelChampionsCoopAction, MarvelChampionsCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarvelChampionsCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const marvelChampionsCoopPlugin: GamePlugin<MarvelChampionsCoopState, MarvelChampionsCoopAction, typeof settings> = {
  id: "marvel-champions-coop",
  title: "Marvel Champions",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heroes team up against Marvel villains.",
  howToPlay: "Marvel Champions is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarvelChampionsCoopSettings),
  reducer,
  isTerminal,
  component: MarvelChampionsCoopGame,
};

export default marvelChampionsCoopPlugin;
