import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FortressState, FortressAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FortressSolitaire } from "./FortressSolitaire.js";

export const fortressSolitaireSettings = {} as const;

export const fortressSolitairePlugin: GamePlugin<FortressState, FortressAction, typeof fortressSolitaireSettings> = {
  id: "fortress-solitaire",
  title: "Fortress",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build all four foundations Ace to King by moving same-suit adjacent cards.",
  howToPlay: `Fortress is a patience game where the goal is to build all four foundation piles from Ace to King, one pile per suit.

Deal: 52 cards are spread across 10 columns (two columns of 6, eight of 5), all face-up. The four foundation piles start empty.

Moves: Only single cards may be moved at a time. A card may be placed on another column card if they share the same suit and their ranks are adjacent — one higher or one lower. For example, the 7 of hearts can sit on either the 6 or 8 of hearts. Empty columns accept any card. Cards may also be sent directly to a foundation when they continue the ascending suit sequence from Ace.

Strategy: Because you can build both up and down within suits, you have more flexibility than in many solitaires. Focus on unblocking Aces early. Try to clear a column completely to gain a free cell for maneuvering. Be mindful that building downward in a column can trap useful cards below.

Win condition: All 52 cards on the four foundations in suit order Ace through King.`,
  settings: fortressSolitaireSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: FortressSolitaire,
};
