import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { UndauntedNorthAfricaState, UndauntedNorthAfricaAction, UndauntedNorthAfricaSettings } from "./state.js";
import { UndauntedNorthAfrica_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { UndauntedNorthAfricaGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const undauntedNorthAfricaPlugin: GamePlugin<UndauntedNorthAfricaState, UndauntedNorthAfricaAction, typeof settings> = {
  id: "undaunted-north-africa",
  title: "Undaunted: North Africa",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Desert WWII deck builder.",
  howToPlay: "Undaunted: North Africa is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UndauntedNorthAfricaSettings),
  reducer,
  isTerminal,
  hint: (state: UndauntedNorthAfricaState): HintTarget | null => {
    const sel = coopHintSelector(state, UndauntedNorthAfrica_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: UndauntedNorthAfricaGame,
};

export default undauntedNorthAfricaPlugin;
