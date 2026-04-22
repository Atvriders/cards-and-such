import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { EightOffState, EightOffAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EightOff } from "./EightOff.js";

export const eightOffSettings = {} as const;

export const eightOffPlugin: GamePlugin<EightOffState, EightOffAction, typeof eightOffSettings> = {
  id: "eight-off",
  title: "Eight Off",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell with 8 free cells and same-suit tableau building.",
  howToPlay: `Eight Off is a FreeCell variant that gives you eight free cells instead of four — but compensates by requiring same-suit builds on the tableau instead of alternating colors.

Deal: All 52 cards fill eight cascades (six cards each = 48 cards), all face-up. The remaining four cards start pre-loaded in four of the eight free cells.

Cells: Each of the eight free cells can hold exactly one card at a time. Use cells to temporarily park cards that are blocking important moves. Having eight cells gives you tremendous flexibility — but don't fill them all, or you'll have nowhere to move.

Tableau: Build cascades downward in the same suit. A 7 of clubs goes on an 8 of clubs, not an 8 of hearts. You may pick up and move a same-suit consecutive sequence together. Empty cascades can accept any card.

Foundations: Build each suit up from Ace to King. Once a card is on a foundation, it stays there. Use Auto-move to send all safe cards to foundations at once.

Scoring: +10 per card moved to a foundation.

Tips: Plan suit builds carefully — the same-suit rule means you'll need specific cards to extend runs. Eight cells feel generous, but filling them all locks the game.`,
  settings: eightOffSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: EightOff,
};
