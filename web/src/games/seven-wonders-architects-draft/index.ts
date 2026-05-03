import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftAction, SevenWondersArchitectsDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SevenWondersArchitectsDraftGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SevenWondersArchitectsDraftGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersArchitectsDraftPlugin: GamePlugin<SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftAction, typeof settings> = {
  id: "seven-wonders-architects-draft",
  title: "Seven Wonders: Architects",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting: pick one of 3 each round, build combos.",
  howToPlay: "Seven Wonders: Architects is a card-drafting game over 8 rounds. Each round, 3 cards are revealed; pick one and the CPU greedily takes the highest-rank remaining. Cards belong to 4 suits: Stone, Wood, Cat, Progress. Score by combining suits and ranks: 3 of the same suit earns +10, 5 of the same suit earns another +20; pairs of the same rank earn +5, three-of-a-kind earns +12. Raw rank values sum into your tableau total. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus 1-2 suits to lock multiple suit bonuses; the CPU greedily grabs high-rank cards, so undervalued same-suit picks slip through.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersArchitectsDraftSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "drafting" && state.offer.length > 0 ? { selector: '[class$="-offer"] > button:first-child', pulses: 3 } : null,
  component: SevenWondersArchitectsDraftGame,
};
