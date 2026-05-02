import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazeMaxSecurityState, MagicMazeMaxSecurityAction, MagicMazeMaxSecuritySettings } from "./state.js";
import { MagicMazeMaxSecurity_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { MagicMazeMaxSecurityGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const magicMazeMaxSecurityPlugin: GamePlugin<MagicMazeMaxSecurityState, MagicMazeMaxSecurityAction, typeof settings> = {
  id: "magic-maze-max-security",
  title: "Magic Maze: Max Security",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hardest Magic Maze: cameras everywhere.",
  howToPlay: "Magic Maze: Max Security is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazeMaxSecuritySettings),
  reducer,
  isTerminal,
  hint: (state: MagicMazeMaxSecurityState): HintTarget | null => {
    const sel = coopHintSelector(state, MagicMazeMaxSecurity_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MagicMazeMaxSecurityGame,
};

export default magicMazeMaxSecurityPlugin;
