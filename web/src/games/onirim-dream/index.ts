import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OnirimDreamState, OnirimDreamAction, OnirimDreamSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OnirimDreamGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OnirimDreamGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const onirimDreamPlugin: GamePlugin<OnirimDreamState, OnirimDreamAction, typeof settings> = {
  id: "onirim-dream",
  title: "Onirim",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo/co-op dream door card game — navigate labyrinths before nightmares arrive.",
  howToPlay: "Onirim is a dream-door card distillation. Across ten turns you navigate labyrinths gathering door cards before nightmares arrive. You begin with $200 cash (representing dream energy), no Door cards, and no Key cards. Each turn, pick one action: Buy a Door for $35, Save energy for 5% interest, Buy a Key for $55, or Discard a Door for $25-45 reward.\n\nAfter your action, every Door earns $7 from dream lucidity and every Key earns $11 from labyrinth navigation. A dream event flavors each turn — sometimes a nightmare looms, sometimes serenity. Your final score is net worth — energy plus cost-basis of doors and keys. Wake up rich in lucid dreams. Find every door before midnight.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OnirimDreamSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-onirim-dream-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-onirim-dream-next"]', pulses: 3 };
    return null;
  },
  component: OnirimDreamGame,
};
