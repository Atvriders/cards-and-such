import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelChampionsCoopState, MarvelChampionsCoopAction, MarvelChampionsCoopSettings } from "./state.js";
import { MarvelChampionsCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const MarvelChampionsCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MarvelChampionsCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const marvelChampionsCoopPlugin: GamePlugin<MarvelChampionsCoopState, MarvelChampionsCoopAction, typeof settings> = {
  id: "marvel-champions-coop",
  title: "Marvel Champions",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heroes team up against Marvel villains.",
  howToPlay: "Marvel Champions is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarvelChampionsCoopSettings),
  reducer,
  isTerminal,
  hint: (state: MarvelChampionsCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, MarvelChampionsCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MarvelChampionsCoopGame,
};

export default marvelChampionsCoopPlugin;
