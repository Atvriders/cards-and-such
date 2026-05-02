import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionProsperityState, DominionProsperityAction, DominionProsperitySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionProsperityGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dominionProsperityPlugin: GamePlugin<DominionProsperityState, DominionProsperityAction, typeof settings> = {
  id: "dominion-prosperity",
  title: "Dominion: Prosperity",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Big-money Dominion expansion.",
  howToPlay: "Dominion: Prosperity is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DominionProsperitySettings),
  reducer,
  isTerminal,
  component: DominionProsperityGame,
};

export default dominionProsperityPlugin;
