import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DungeonLordsTrapState, DungeonLordsTrapAction, DungeonLordsTrapSettings } from "./state.js";
import { DungeonLordsTrap_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { DungeonLordsTrapGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dungeonLordsTrapPlugin: GamePlugin<DungeonLordsTrapState, DungeonLordsTrapAction, typeof settings> = {
  id: "dungeon-lords-trap",
  title: "Dungeon Lords: Trap",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lay traps; lure heroes to their doom.",
  howToPlay: "Dungeon Lords: Trap is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DungeonLordsTrapSettings),
  reducer,
  isTerminal,
  hint: (state: DungeonLordsTrapState): HintTarget | null => {
    const sel = coopHintSelector(state, DungeonLordsTrap_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: DungeonLordsTrapGame,
};

export default dungeonLordsTrapPlugin;
