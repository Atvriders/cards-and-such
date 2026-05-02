import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LotrLcgFellowState, LotrLcgFellowAction, LotrLcgFellowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LotrLcgFellowGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const lotrLcgFellowPlugin: GamePlugin<LotrLcgFellowState, LotrLcgFellowAction, typeof settings> = {
  id: "lotr-lcg-fellow",
  title: "LOTR LCG: Fellowship",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fellowship multi-deck campaign of LOTR LCG.",
  howToPlay: "LOTR LCG: Fellowship is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LotrLcgFellowSettings),
  reducer,
  isTerminal,
  component: LotrLcgFellowGame,
};

export default lotrLcgFellowPlugin;
