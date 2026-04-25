import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MarthaState, MarthaAction, MarthaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Martha } from "./Martha.js";

export const marthaSettings = {} as const;

export const marthaPlugin: GamePlugin<MarthaState, MarthaAction, typeof marthaSettings> = {
  id: "martha",
  title: "Martha",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A Klondike variant where tableau builds down in the same suit.",
  howToPlay: `Martha is a Klondike-family solitaire distinguished by one key rule change on the tableau: builds must be in the same suit rather than alternating colors.

Setup: Seven tableau columns are dealt in the classic Klondike triangle (one card in column 1, two in column 2, up to seven in column 7, with only the top card face-up). Then three additional face-up cards are dealt to each column. The remaining cards form the stock; the waste begins empty.

Goal: Move all 52 cards onto the four foundations, built up by suit from Ace to King.

Tableau: Build down in the same suit. For example, the 9 of Spades may only go on the 10 of Spades. Empty tableau columns accept only Kings (and any same-suit sequence below them).

Stock and waste: Draw one card at a time from the stock to the waste. The waste top is always playable. There is no limit on recycling the waste.

Tip: Same-suit building is far more restrictive than alternating colors — sequences of the same suit are rare. Prioritize uncovering face-down cards to create mobility, and use empty columns carefully since only Kings may fill them.`,
  settings: marthaSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Martha,
};
