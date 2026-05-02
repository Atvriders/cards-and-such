import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LordOfRingsLcgState, LordOfRingsLcgAction, LordOfRingsLcgSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LordOfRingsLcgGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const lordOfRingsLcgPlugin: GamePlugin<LordOfRingsLcgState, LordOfRingsLcgAction, typeof settings> = {
  id: "lord-of-rings-lcg",
  title: "Lord of the Rings LCG",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lord of the Rings LCG full campaign.",
  howToPlay: "Lord of the Rings LCG is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LordOfRingsLcgSettings),
  reducer,
  isTerminal,
  component: LordOfRingsLcgGame,
};

export default lordOfRingsLcgPlugin;
