import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CavernaCaveVsCaveState, CavernaCaveVsCaveAction, CavernaCaveVsCaveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CavernaCaveVsCaveGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CavernaCaveVsCaveGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cavernaCaveVsCavePlugin: GamePlugin<CavernaCaveVsCaveState, CavernaCaveVsCaveAction, typeof settings> = {
  id: "caverna-cave-vs-cave",
  title: "Caverna: Cave vs Cave",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player streamlined Caverna — card-only cave room decisions.",
  howToPlay: "Caverna: Cave vs Cave is a two-player streamlined Caverna. Across ten turns you carve cave rooms and harvest dwarf labor. You begin with $200 cash, no Room cards, and no Dwarves. Each turn, pick one action: Buy a Room for $35, Save your cash for 5% interest, Hire a Dwarf for $55, or Sell a Room back to the quarry for $25-45.\n\nAfter your action, every Room earns $7 from rent and every Dwarf earns $11 from labor. A cave-dwelling event flavors each turn — sometimes a strike of gold, sometimes a cave-in. Your final score is net worth — cash plus the cost-basis value of rooms and dwarves. Carve carefully, hire steadily, and end with the strongest cave operation. Long live the underdark.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CavernaCaveVsCaveSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-caverna-cave-vs-cave-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-caverna-cave-vs-cave-next"]', pulses: 3 };
    return null;
  },
  component: CavernaCaveVsCaveGame,
};
