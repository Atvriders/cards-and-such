import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RussianSolitaireState, RussianSolitaireAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RussianSolitaire } from "./RussianSolitaire.js";

export const russianSolitaireSettings = {} as const;

type RussianSolitaireSettings = SettingsOf<typeof russianSolitaireSettings>;

export const russianSolitairePlugin: GamePlugin<RussianSolitaireState, RussianSolitaireAction, typeof russianSolitaireSettings> = {
  id: "russian-solitaire",
  title: "Russian Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Like Yukon, but tableau builds down in the same suit. Move any face-up card with all cards resting on it.",
  howToPlay: `Russian Solitaire is a close cousin of Yukon — the critical difference is that the tableau builds down in the same suit rather than alternating colors.

Deal: All 52 cards are dealt to seven tableau columns. Column 1 gets one face-up card. Columns 2–7 follow the Yukon pattern: increasing numbers of face-down cards at the bottom, with the top several cards face-up. No stock pile exists.

Objective: Move all 52 cards to the four foundations, building each foundation up from Ace to King in the same suit.

Tableau rules: Place a card (or a group of face-up cards) on a tableau column when the bottom card of your moving group is the same suit and exactly one rank lower than the current top card of the target column. Only Kings may be placed on empty columns.

The Yukon pickup rule applies: you may grab any face-up card together with every card sitting on top of it, even if those cards don't form a proper same-suit sequence. The landing card is the only one that must satisfy the stacking rule.

Face-down cards are automatically revealed when uncovered.

Scoring: +10 per card sent to a foundation. Use Auto-move to sweep safe cards automatically.

Tips: Prioritize uncovering face-down cards. Same-suit runs are rarer and harder to extend than alternating-color runs, so plan moves carefully.`,
  settings: russianSolitaireSettings,
  initialState: (seed: number, settings: RussianSolitaireSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RussianSolitaire,
};
