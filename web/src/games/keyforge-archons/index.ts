import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KeyforgeArchonsState, KeyforgeArchonsAction, KeyforgeArchonsSettings } from "./state.js";
import { KeyforgeArchons_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const KeyforgeArchonsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KeyforgeArchonsGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const keyforgeArchonsPlugin: GamePlugin<KeyforgeArchonsState, KeyforgeArchonsAction, typeof settings> = {
  id: "keyforge-archons",
  title: "KeyForge: Archons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Unique-deck card duel — coop variant.",
  howToPlay: "KeyForge: Archons is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KeyforgeArchonsSettings),
  reducer,
  isTerminal,
  hint: (state: KeyforgeArchonsState): HintTarget | null => {
    const sel = coopHintSelector(state, KeyforgeArchons_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: KeyforgeArchonsGame,
};

export default keyforgeArchonsPlugin;
