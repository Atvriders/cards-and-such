import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritOfForestState, SpiritOfForestAction, SpiritOfForestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpiritOfForestGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpiritOfForestGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spiritOfForestPlugin: GamePlugin<SpiritOfForestState, SpiritOfForestAction, typeof settings> = {
  id: "spirit-of-forest",
  title: "Spirit of the Forest",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative resource collecting — protect nature spirits.",
  howToPlay: "Spirit of the Forest is a cooperative resource-collection card distillation. Across ten turns you protect forest spirits by gathering tokens. You begin with $200 cash, no Spirit cards, and no Grove upgrades. Each turn, pick one action: Buy a Spirit Token for $35, Save your cash for 5% interest, Buy a Grove for $55, or Sell a Spirit back for $25-45.\n\nAfter your action, every Spirit earns $7 from blessings and every Grove earns $11 from sanctuary tithes. A nature event flavors each turn — sometimes a bird flock blesses you, sometimes deer scatter. Your final score is net worth — cash plus the cost-basis value of spirits and groves. Protect the forest. Gather the light.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritOfForestSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-spirit-of-forest-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-spirit-of-forest-next"]', pulses: 3 };
    return null;
  },
  component: SpiritOfForestGame,
};
