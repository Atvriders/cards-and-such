import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TriPeaksState, TriPeaksAction } from "./state.js";
import { initialState, reducer, isTerminal, triPeaksSettings, isUncovered } from "./state.js";
import { TriPeaks } from "./TriPeaks.js";

type TriPeaksSettings = SettingsOf<typeof triPeaksSettings>;

export const triPeaksPlugin: GamePlugin<TriPeaksState, TriPeaksAction, typeof triPeaksSettings> = {
  id: "tri-peaks",
  title: "TriPeaks",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three peaks to clear. Remove cards one rank up or down from the current.",
  howToPlay: `Clear three pyramid peaks by removing cards that are one rank higher or lower than the current waste card. Build the longest chain you can!

Layout: Three overlapping peaks form a grid of 28 cards across 4 rows, with 24 stock cards below. The current card sits at the right. A card in the peaks is playable only when the cards covering it have already been removed — start from the base row.

Moves: Click any uncovered peak card that is one rank higher or one lower than the current waste card. The card is removed and becomes the new current card, letting you chain another. Aces wrap (optional setting): Ace can follow King and King can follow Ace. Click the stock to draw a new current card when no peak card matches.

Scoring: Each card removed scores points. Chains score progressively more — the longer your streak without drawing from stock, the higher the bonus. Clearing all three peaks wins the game.

Tips: Look ahead before clicking — sometimes skipping a match to draw from stock sets up a longer chain. Prioritize uncovering buried peaks early so all three become accessible.`,
  settings: triPeaksSettings,
  initialState: (seed: number, settings: TriPeaksSettings) => initialState(seed, settings),
  hint: (state: TriPeaksState): HintTarget | null => {
    if (state.won || state.lost) return null;
    const wv = state.currentCard.rank as number;
    const wrap = state.settings.wrapAces;
    const adj = (a: number, b: number): boolean => {
      if (Math.abs(a - b) === 1) return true;
      if (wrap && ((a === 1 && b === 13) || (a === 13 && b === 1))) return true;
      return false;
    };
    for (let r = 0; r < state.pyramid.length; r++) {
      const row = state.pyramid[r]!;
      for (let c = 0; c < row.length; c++) {
        const cell = row[c]!;
        if (cell.removed) continue;
        if (!isUncovered(state.pyramid, r, c)) continue;
        if (adj(cell.card.rank as number, wv)) {
          return { selector: `[data-testid="hint-target-tri-peaks-${r}-${c}"]`, pulses: 3 };
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-tri-peaks-stock"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: TriPeaks,
};
