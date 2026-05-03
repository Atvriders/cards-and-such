import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type SnipSnapState, type SnipSnapAction } from "./state.js";
const SnipSnapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SnipSnapGame as unknown as React.ComponentType<unknown> })));
export const snipSnapSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const snipSnapSnoremPlugin: GamePlugin<SnipSnapState, SnipSnapAction, typeof snipSnapSettings> = {
  id: "snip-snap-snorem",
  title: "Snip-Snap-Snorem",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match ranks in sequence — Snip, Snap, Snorem — then start the next!",
  howToPlay: `Snip-Snap-Snorem is a Victorian parlour card game for 2-4 players. The full deck is dealt evenly among all players. The first player starts by playing any card from their hand.

The next player must play another card of the same rank and call out "Snip!" If they don't have the rank, they are skipped and the turn passes to the following player. The third to play that rank calls "Snap!", and the fourth calls "Snorem!" When all four cards of a rank are played, the player who called Snorem opens the next sequence with any card they choose.

Cards highlighted in blue in your hand are currently playable. The sequence tracker shows which rank is active and how many cards have been played. If you cannot match the active rank you are passed over automatically.

The first player to empty their hand wins! Bots play automatically when it is their turn.

Tips: holding multiple cards of the same rank is powerful because you can call Snap and Snorem quickly. Try to play your plentiful ranks early to unload your hand faster.

Score 500 for a win; partial credit based on how many cards you played if you lose.`,
  settings: snipSnapSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: SnipSnapState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-snip-snap-snorem-primary"]', pulses: 3 };
  },
  component: SnipSnapGame,
};
