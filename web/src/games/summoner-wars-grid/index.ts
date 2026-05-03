import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SummonerWarsGridState, SummonerWarsGridAction, SummonerWarsGridSettings } from "./state.js";
import { SummonerWarsGrid_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const SummonerWarsGridGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SummonerWarsGridGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const summonerWarsGridPlugin: GamePlugin<SummonerWarsGridState, SummonerWarsGridAction, typeof settings> = {
  id: "summoner-wars-grid",
  title: "Summoner Wars: Grid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Grid combat with summoners.",
  howToPlay: "Summoner Wars: Grid is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SummonerWarsGridSettings),
  reducer,
  isTerminal,
  hint: (state: SummonerWarsGridState): HintTarget | null => {
    const sel = coopHintSelector(state, SummonerWarsGrid_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SummonerWarsGridGame,
};

export default summonerWarsGridPlugin;
