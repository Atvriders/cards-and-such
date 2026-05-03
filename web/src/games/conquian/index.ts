import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConquianState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Conquian } from "./Conquian.js";

export const conquianSettings = {} as const;
type ConquianSettings = SettingsOf<typeof conquianSettings>;

type ConquianAction =
  | { type: "take" }
  | { type: "pass" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export const conquianPlugin: GamePlugin<ConquianState, ConquianAction, typeof conquianSettings> = {
  id: "conquian",
  title: "Conquian",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The Mexican ancestor of Gin Rummy. Meld all cards from the discard pile to win.",
  howToPlay: `Conquian is a 2-player Mexican rummy game considered the direct ancestor of Gin Rummy. It uses a 40-card Spanish deck (Ace through 7, plus Jack, Queen, King).

Setup: Each player is dealt 10 cards. One card is placed face-up to start the discard pile.

Your turn: The top of the discard pile is offered to you.
- Take: Pick up the top discard card. You must then either meld it (include it in a valid meld group) or discard it back. You cannot keep it in hand without melding.
- Pass: Decline the discard. The bot then decides whether to take it.

Melds: Valid melds are groups of 3 or 4 cards of the same rank, or runs of 3+ consecutive same-suit cards. Ace is lowest (A-2-3), King is highest (J-Q-K).

Winning: Be the first to meld all cards from your hand. After melding a group, remaining cards must eventually be melded as well.

The key constraint: You MUST use the card you draw — either meld it or discard it. You cannot simply hold it. This creates the interesting tension of Conquian, where players must carefully manage what they discard since the opponent may use it.

Strategy: Track what the bot passes on. If the bot passes a card, it probably doesn't fit their melds — you might take it to deny future value. Always prioritize melds that remove the most cards at once.`,
  settings: conquianSettings,
  initialState: (seed: number, _settings: ConquianSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: ConquianState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-conquian-primary"]', pulses: 3 };
  },
  component: Conquian,
};
