import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BetsyRossState, BetsyRossAction } from "./state.js";
import { BetsyRossGame } from "./Game.js";

const settings = {} as const;

export const betsyRossPlugin: GamePlugin<BetsyRossState, BetsyRossAction, typeof settings> = {
  id: "betsy-ross",
  title: "Betsy Ross",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A stock-and-waste solitaire that builds foundations by skipping every other rank.",
  howToPlay: `Betsy Ross is a solitaire named after the American flag maker, played with a single 52-card deck. Its defining feature is building foundations by twos — skipping every other rank — rather than one at a time.

Setup: One Ace per suit is extracted and placed on four foundation piles. The remaining 48 cards form the stock.

Goal: Build each foundation through all 13 cards in the sequence Ace, 3, 5, 7, 9, Jack, King, 2, 4, 6, 8, 10, Queen — counting up by 2 and wrapping past King back to 2.

Play: Flip one card at a time from the stock onto the waste pile. Whenever the top of the waste pile is the next card needed on any foundation, click it to send it there. When the stock runs out, flip the waste pile over to form a new stock. You may redeal as often as needed.

There are no tableau columns — this is a pure draw-and-place game. The challenge is patience: you must wait for each card in the unusual sequence to appear. Watch all four foundations simultaneously, since a single drawn card might fit any one of them. High replayability despite simple rules.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: BetsyRossGame,
};
