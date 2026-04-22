import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HandAndFootState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HandAndFoot } from "./HandAndFoot.js";

export const handAndFootSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type HandAndFootSettingsRaw = SettingsOf<typeof handAndFootSettings>;

type HandAndFootAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

function coerceSettings(s: HandAndFootSettingsRaw): import("./state.js").HandAndFootSettings {
  return { botCount: s.botCount };
}

export const handAndFootPlugin: GamePlugin<HandAndFootState, HandAndFootAction, typeof handAndFootSettings> = {
  id: "hand-and-foot",
  title: "Hand and Foot",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multi-deck rummy with two hands per player. Form canastas to score big.",
  howToPlay: `Hand and Foot is a multi-deck rummy game using 4 standard decks plus 8 jokers (216 cards total). Each player receives two groups of 11 cards: the "hand" (played first) and the "foot" (played after the hand is exhausted).

On your turn, draw 2 cards from the stock pile (or take the top discard card). Then meld sets of 3 or more cards of the same rank, and finally discard one card.

Melds come in two flavors. A clean meld contains no wild cards (2s or Jokers) and scores more. A dirty meld may include wilds, but naturals must outnumber wilds. A Canasta is any meld of 7 or more cards — a natural Canasta (clean) scores 500 bonus points; a mixed Canasta scores 300.

When your hand is empty, pick up your foot and continue playing. You may go out when your foot is gone and you have formed at least one Canasta. Going out earns a bonus.

Scoring: Clean meld = 500 per Canasta, dirty = 300. Individual melded cards score their pip value.

Controls: Click "Draw Stock" to draw 2 cards. Click cards in your hand to select them, then click "Meld" to place them on the table. Click a single card and "Discard" to end your turn.`,
  settings: handAndFootSettings,
  initialState: (seed: number, s: HandAndFootSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  component: HandAndFoot,
};
