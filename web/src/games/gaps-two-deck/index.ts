import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GapsTwoDeckState, GapsTwoDeckAction, GapsTwoDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GapsTwoDeckGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gapsTwoDeckPlugin: GamePlugin<GapsTwoDeckState, GapsTwoDeckAction, typeof settings> = {
  id: "gaps-two-deck",
  title: "Gaps (Two Deck)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Gaps — slide cards into matching-suit ascending sequences.",
  howToPlay: "Two-deck Gaps — slide cards into matching-suit ascending sequences. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GapsTwoDeckSettings),
  hint: (state: GapsTwoDeckState): HintTarget | null => {
    if (state.won || state.lost) return null;
    for (let r = 0; r < state.grid.length; r++) {
      const row = state.grid[r]!;
      for (let c = 0; c < row.length; c++) {
        if (row[c]!.card) continue;
        if (c === 0) {
          for (let r2 = 0; r2 < state.grid.length; r2++) {
            for (let c2 = 0; c2 < state.grid[r2]!.length; c2++) {
              const cd = state.grid[r2]![c2]!.card;
              if (cd && cd.rank === 2) {
                return { selector: `[data-testid="hint-target-gaps-two-deck-${r}-${c}"]`, pulses: 3 };
              }
            }
          }
        } else {
          const left = state.grid[r]?.[c - 1]?.card;
          if (!left) continue;
          for (let r2 = 0; r2 < state.grid.length; r2++) {
            for (let c2 = 0; c2 < state.grid[r2]!.length; c2++) {
              const cd = state.grid[r2]![c2]!.card;
              if (cd && cd.suit === left.suit && (cd.rank as number) === (left.rank as number) + 1) {
                return { selector: `[data-testid="hint-target-gaps-two-deck-${r}-${c}"]`, pulses: 3 };
              }
            }
          }
        }
      }
    }
    if (state.redealsRemaining > 0) {
      return { selector: '[data-testid="hint-target-gaps-two-deck-redeal"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: GapsTwoDeckGame,
};
