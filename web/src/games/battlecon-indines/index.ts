import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BattleconIndinesState, BattleconIndinesAction, BattleconIndinesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BattleconIndinesGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const battlecon_indines_plugin: GamePlugin<BattleconIndinesState, BattleconIndinesAction, typeof settings> = {
  id: "battlecon-indines",
  title: "BattleCON: Indines",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-pair fighting game.",
  howToPlay: "BattleCON: Indines is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BattleconIndinesSettings),
  reducer,
  isTerminal,
  component: BattleconIndinesGame,
};

export default battlecon_indines_plugin;
