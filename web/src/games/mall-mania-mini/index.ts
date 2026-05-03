import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { MallState, MallAction, MallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MallManiaMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MallManiaMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mallManiaMiniPlugin: GamePlugin<MallState, MallAction, typeof settings> = {
  id: "mall-mania-mini",
  title: "Mall Mania Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice and shop a 4x4 mall layout. Maximize items collected within a $100 budget.",
  howToPlay: `Mall Mania Mini is a tiny shopping board game inspired by 1980s family mall games. The board is a 4x4 grid of shops, each with a price and a category. You start with $100 and 16 turns of shopping.

How to play:
1. Press Roll to roll a 6-sided die. Your shopper moves around the 16-square mall in a fixed order, advancing 1-6 squares per roll.
2. The shop you land on shows its name, price, and category. Press Buy to purchase, or Skip to save your money.
3. Categories matter:
   — Deal: pay the price, get 2 items.
   — Fair: pay the price, get 1 item.
   — Splurge: high price, only 1 item.
   — Freebie: free, 1 item.
   — Dud: pay but receive nothing useful.

You cannot buy if your budget is too low; the Buy button is disabled when you are short.

After 16 turns the mall closes. Final score = items × 20 + cash remaining. Hunting for Deals and Freebies while avoiding Duds is the strategy. Aim for over 200 to feel like you got real value.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MallSettings),
  reducer,
  isTerminal, hint: (state: MallState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-mall-mania-mini-primary"]', pulses: 3 } : null),
  component: MallManiaMiniGame,
};
