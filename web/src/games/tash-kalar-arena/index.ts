import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TashKalarArenaState, TashKalarArenaAction, TashKalarArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TashKalarArenaGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tashKalarArenaPlugin: GamePlugin<TashKalarArenaState, TashKalarArenaAction, typeof settings> = {
  id: "tash-kalar-arena",
  title: "Tash-Kalar: Arena",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pattern-summoning duel — coop variant.",
  howToPlay: "Tash-Kalar: Arena is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TashKalarArenaSettings),
  reducer,
  isTerminal,
  component: TashKalarArenaGame,
};

export default tashKalarArenaPlugin;
