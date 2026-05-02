import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionIntrigueState, DominionIntrigueAction, DominionIntrigueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionIntrigueGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dominionIntriguePlugin: GamePlugin<DominionIntrigueState, DominionIntrigueAction, typeof settings> = {
  id: "dominion-intrigue",
  title: "Dominion: Intrigue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Court-intrigue Dominion expansion.",
  howToPlay: "Dominion: Intrigue is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DominionIntrigueSettings),
  reducer,
  isTerminal,
  component: DominionIntrigueGame,
};

export default dominionIntriguePlugin;
