import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, SentinelsMultiverseCoopSettings } from "./state.js";
import { SentinelsMultiverseCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const SentinelsMultiverseCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SentinelsMultiverseCoopGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sentinelsMultiverseCoopPlugin: GamePlugin<SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, typeof settings> = {
  id: "sentinels-multiverse-coop",
  title: "Sentinels of the Multiverse",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Comic-book heroes defeat villains in the Multiverse.",
  howToPlay: "Sentinels of the Multiverse is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsMultiverseCoopSettings),
  reducer,
  isTerminal,
  hint: (state: SentinelsMultiverseCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, SentinelsMultiverseCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SentinelsMultiverseCoopGame,
};

export default sentinelsMultiverseCoopPlugin;
