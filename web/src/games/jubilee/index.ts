import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { JubileeState, JubileeAction, JubileeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Jubilee = /* @__PURE__ */ lazy(() => import("./Jubilee.js").then((mod) => ({ default: mod.Jubilee as unknown as React.ComponentType<unknown> })));
export const jubileeSettings = {} as const;

export const jubileePlugin: GamePlugin<JubileeState, JubileeAction, typeof jubileeSettings> = {
  id: "jubilee",
  title: "Jubilee",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire — build 8 foundations upward by fives, wrapping around the rank cycle.",
  howToPlay: `Jubilee is a two-deck solitaire featuring a unique foundation-building rule: instead of building Ace to King in sequence, each foundation pile builds upward by fives in circular order (A→6→J→3→8→K→5→10→2→7→Q→4→9→A), continuing to wrap around.

Setup: 104 cards (two standard decks) are shuffled together. Ten tableau columns of five cards each are dealt face-up, with the remaining cards going to the stock. Eight foundations (two per suit) begin empty; the first card of each suit played to a foundation determines the starting rank for both foundations of that suit.

Play: click a card in the tableau or waste to select it, then click a foundation to place it there if it is the correct next rank for that suit. You may also move top cards between tableau columns freely to rearrange. Draw from the stock one card at a time; there is no redeal.

Win by building all 104 cards across the eight foundations. Each card placed on a foundation scores 5 points.

Tips: pay attention to which rank will "base" each suit — the first card you commit to a foundation locks in the cycle for both copies of that suit. Manage the tableau to keep useful cards accessible as the stock runs out.`,
  settings: jubileeSettings,
  initialState: (seed: number) => initialState(seed, {} as JubileeSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Jubilee,
};
