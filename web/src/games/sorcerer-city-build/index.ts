import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SorcererCityBuildState, SorcererCityBuildAction, SorcererCityBuildSettings } from "./state.js";
import { SorcererCityBuild_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { SorcererCityBuildGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sorcererCityBuildPlugin: GamePlugin<SorcererCityBuildState, SorcererCityBuildAction, typeof settings> = {
  id: "sorcerer-city-build",
  title: "Sorcerer City",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile-laying city builder.",
  howToPlay: "Sorcerer City is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SorcererCityBuildSettings),
  reducer,
  isTerminal,
  hint: (state: SorcererCityBuildState): HintTarget | null => {
    const sel = coopHintSelector(state, SorcererCityBuild_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SorcererCityBuildGame,
};

export default sorcererCityBuildPlugin;
