import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LotrLcgCoopState, LotrLcgCoopAction, LotrLcgCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LotrLcgCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const lotrLcgCoopPlugin: GamePlugin<LotrLcgCoopState, LotrLcgCoopAction, typeof settings> = {
  id: "lotr-lcg-coop",
  title: "LOTR LCG",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heroes of Middle-earth on quests.",
  howToPlay: "LOTR LCG is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LotrLcgCoopSettings),
  reducer,
  isTerminal,
  component: LotrLcgCoopGame,
};

export default lotrLcgCoopPlugin;
