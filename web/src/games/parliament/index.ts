import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type ParliamentState, type ParliamentAction } from "./state.js";
import { ParliamentGame } from "./Game.js";

export const parliamentSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const parliamentPlugin: GamePlugin<ParliamentState, ParliamentAction, typeof parliamentSettings> = {
  id: "parliament",
  title: "Parliament",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build sequences out from the 7s by suit — first empty hand wins.",
  howToPlay: `Parliament (also called Fan Tan or Sevens) is a classic sequence-building shedding game for 2-4 players. The full deck is dealt evenly; any leftover cards go to the first players.

On your turn, play one card onto the table or pass if you have nothing legal. The board has four suit piles, each started by the 7 of that suit. Once a 7 is played, the sequence for that suit extends both upward (8, 9, 10…K) and downward (6, 5, 4…A). You can only play a card if it is immediately adjacent to the current range in its suit.

You must play if you legally can — passing when a valid move exists is not allowed. Bots play automatically when it is their turn.

Strategy matters: blocking opponents by holding back key cards (such as 6s or 8s in a suit they desperately need) is a powerful tactic. The player who empties their hand first wins.

Score 500 for a win. If you lose, score 10 points for each card you managed to play.`,
  settings: parliamentSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: ParliamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-parliament-primary"]', pulses: 3 };
  },
  component: ParliamentGame,
};
