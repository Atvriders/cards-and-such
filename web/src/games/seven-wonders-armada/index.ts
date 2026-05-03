import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersArmadaState, SevenWondersArmadaAction, SevenWondersArmadaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SevenWondersArmadaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SevenWondersArmadaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersArmadaPlugin: GamePlugin<SevenWondersArmadaState, SevenWondersArmadaAction, typeof settings> = {
  id: "seven-wonders-armada",
  title: "Seven Wonders: Armada",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting: pick one of 4 each round, build combos.",
  howToPlay: "Seven Wonders: Armada is a card-drafting game over 9 rounds. Each round, 4 cards are revealed; pick one and the CPU greedily takes the highest-rank remaining. Cards belong to 4 suits: Naval, Trade, Explore, Pirate. Score by combining suits and ranks: 3 of the same suit earns +10, 5 of the same suit earns another +20; pairs of the same rank earn +5, three-of-a-kind earns +12. Raw rank values sum into your tableau total. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus 1-2 suits to lock multiple suit bonuses; the CPU greedily grabs high-rank cards, so undervalued same-suit picks slip through.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersArmadaSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "drafting" && state.offer.length > 0 ? { selector: '[class$="-offer"] > button:first-child', pulses: 3 } : null,
  component: SevenWondersArmadaGame,
};
