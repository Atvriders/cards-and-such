import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DemonState, DemonAction, DemonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Demon } from "./Demon.js";

export const demonSettings = {} as const;

export const demonPlugin: GamePlugin<DemonState, DemonAction, typeof demonSettings> = {
  id: "demon",
  title: "Demon",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The British classic also known as Canfield — 13-card reserve, draw-three stock, and foundations that start on a random rank.",
  howToPlay: `Demon is the traditional British name for the game North Americans call Canfield. It is one of the most popular solitaire variants and has surprisingly deep strategy despite its simple appearance.

Setup: thirteen cards are dealt face-down as the reserve (only the top card is visible). Four tableau columns of four cards each are dealt face-up. The remaining twenty-two cards form the stock. The first card from the top of the reserve determines the base rank for all four foundations — for example, if it is an 8, each foundation must start with an 8 and build up by suit (8→9→10→J→Q→K→A→2→3→4→5→6→7→8).

Play: draw three cards at a time from the stock; the top waste card is always playable. Build tableau columns downward in alternating colors (red-on-black). You may move only one card at a time. When a tableau column is emptied, it is automatically refilled from the reserve. When the reserve is exhausted, empty columns may not be refilled.

There is no limit on recycling the waste back through the stock.

Win by moving all 52 cards to the four foundations. Score: 5 points per foundation card.

Tips: the base rank governs everything — identify it immediately and plan which cards need to come out first. Clearing the reserve is often the key challenge.`,
  settings: demonSettings,
  initialState: (seed: number) => initialState(seed, {} as DemonSettings),
  reducer,
  isTerminal,
  component: Demon,
};
