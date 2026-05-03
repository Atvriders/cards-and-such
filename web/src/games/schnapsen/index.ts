import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchnapsenState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Schnapsen = /* @__PURE__ */ lazy(() => import("./Schnapsen.js").then((mod) => ({ default: mod.Schnapsen as unknown as React.ComponentType<unknown> })));
export const schnapsenSettings = {} as const;
type SchnapsenSettings = SettingsOf<typeof schnapsenSettings>;
type SchnapsenAction = { type: "play"; cardId: string } | { type: "marriage" };

export const schnapsenPlugin: GamePlugin<SchnapsenState, SchnapsenAction, typeof schnapsenSettings> = {
  id: "schnapsen",
  title: "Schnapsen",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Austrian 2-player trick-taking game. Race to 66 points using a 20-card deck.",
  howToPlay: `Schnapsen is Austria's national card game, a sharp 2-player battle using only 20 cards (Jack, Queen, King, Ten, Ace of each suit). The goal is to be the first player to reach 66 points.

**Deal:** Each player receives 5 cards. One card is turned face-up to set the trump suit; remaining cards form the stock (draw pile).

**Card Values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2.

**Open Phase (stock not empty):** Either player may lead any card. You do not need to follow suit or trump. After each trick, both players draw one card from the stock (winner draws first).

**Marriages:** When you hold both King and Queen of the same suit, you may announce a "marriage" when leading the King or Queen — scoring 20 points (40 for the trump marriage).

**Closed Phase (stock exhausted):** Once the stock is empty, you must follow the led suit. If you cannot follow suit, you must trump. If you cannot trump, discard any card.

**Winning:** First to accumulate 66+ points from trick card values (plus any marriage bonuses) wins the hand.

**Strategy:** Marriages provide fast points. Counting cards and knowing when to lead trump are key skills in Schnapsen.`,
  settings: schnapsenSettings,
  initialState: (seed: number, _settings: SchnapsenSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: SchnapsenState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-schnapsen-primary"]', pulses: 3 };
  },
  component: Schnapsen,
};
