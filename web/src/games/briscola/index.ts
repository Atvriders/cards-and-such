import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BriscolaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Briscola } from "./Briscola.js";

export const briscolaSettings = {} as const;
type BriscolaSettings = SettingsOf<typeof briscolaSettings>;
type BriscolaAction = { type: "play"; cardId: string };

export const briscolaPlugin: GamePlugin<BriscolaState, BriscolaAction, typeof briscolaSettings> = {
  id: "briscola",
  title: "Briscola",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Italian trump card game. Capture tricks to earn points; highest trump wins.",
  howToPlay: `Briscola is a beloved Italian trick-taking game played with a 40-card deck (Ace through 7, plus Jack, Queen, King — no 8, 9, or 10).

Setup: Three cards are dealt to each player. The bottom card of the remaining stock is turned face-up to determine the trump suit (the "briscola"). That card stays in the stock and is the last drawn.

Card values: Ace = 11 points, 3 = 10 points, King = 4, Queen = 3, Jack = 2, all others = 0. The total points in the deck is 120.

Play: On your turn, play any card from your hand — there is no requirement to follow suit. After each trick, the winner draws first from the stock, then the opponent. The winner of each trick leads the next.

Winning a trick: The highest trump card wins. If no trump is played, the highest card of the led suit wins. Cards of other suits cannot win.

End of hand: When all cards are played and the stock is exhausted, the player with the most points wins. Score 61 or more to win; a score of exactly 60 each is a draw.

Strategy: Conserve your high-value cards (Ace and 3) for when you can win the trick. Use low trumps to steal valuable non-trump cards played by the opponent.`,
  settings: briscolaSettings,
  initialState: (seed: number, _settings: BriscolaSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Briscola,
};
