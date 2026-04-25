import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PaganiniState, PaganiniAction } from "./state.js";
import { PaganiniGame } from "./Game.js";

const settings = {} as const;

export const paganiniPlugin: GamePlugin<PaganiniState, PaganiniAction, typeof settings> = {
  id: "paganini",
  title: "Paganini",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A challenging tableau solitaire with 8 foundations — two complete sequences per suit.",
  howToPlay: `Paganini is a demanding solitaire named after the virtuoso violinist Niccolò Paganini, reflecting its intricate and difficult nature. Eight foundations must each be completed — two full A-to-K sequences per suit.

Setup: The 52-card deck is dealt face-up into 8 tableau columns. The first four columns hold 7 cards each; the last four hold 6 cards. All tableau cards are visible. Eight foundation piles begin empty.

Goal: Fill all eight foundation piles. Each foundation builds from Ace to King in the same suit. Since there are two foundations per suit, you must build both complete suit sequences — meaning the entire deck ends up on foundations.

Tableau: Build columns downward in alternating colors (red on black, black on red). You may move a sequence of correctly ordered cards together. Empty columns accept any card or sequence.

Strategy: The double-foundation goal means every card must eventually reach a foundation in sequence. Prioritize exposing buried Aces, then manage the color-alternating chains carefully. Empty columns are precious — use them as temporary buffers only when necessary, since losing all empty columns can deadlock the game.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: PaganiniGame,
};
