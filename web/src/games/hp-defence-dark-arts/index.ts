import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HpDefenceDarkArtsState, HpDefenceDarkArtsAction, HpDefenceDarkArtsSettings } from "./state.js";
import { HpDefenceDarkArts_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { HpDefenceDarkArtsGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hpDefenceDarkArtsPlugin: GamePlugin<HpDefenceDarkArtsState, HpDefenceDarkArtsAction, typeof settings> = {
  id: "hp-defence-dark-arts",
  title: "HP: Defence Against the Dark Arts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "DADA-themed Hogwarts Battle variant.",
  howToPlay: "HP: Defence Against the Dark Arts is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HpDefenceDarkArtsSettings),
  reducer,
  isTerminal,
  hint: (state: HpDefenceDarkArtsState): HintTarget | null => {
    const sel = coopHintSelector(state, HpDefenceDarkArts_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: HpDefenceDarkArtsGame,
};

export default hpDefenceDarkArtsPlugin;
