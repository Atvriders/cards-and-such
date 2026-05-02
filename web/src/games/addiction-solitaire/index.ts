import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AddictionSolitaireState, AddictionSolitaireAction, AddictionSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AddictionSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const addictionSolPlugin: GamePlugin<AddictionSolitaireState, AddictionSolitaireAction, typeof settings> = {
  id: "addiction-solitaire",
  title: "Addiction Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Addiction Solitaire — same engine as Montana / Gaps with two redeals.",
  howToPlay: "Addiction Solitaire — same engine as Montana / Gaps with two redeals. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AddictionSolitaireSettings),
  hint: (state: AddictionSolitaireState): HintTarget | null => {
    if (state.won || state.lost) return null;
    for (let r = 0; r < state.grid.length; r++) {
      const row = state.grid[r]!;
      for (let c = 0; c < row.length; c++) {
        if (row[c]!.card !== null) continue;
        if (c === 0) {
          for (let r2 = 0; r2 < state.grid.length; r2++) {
            for (let c2 = 0; c2 < state.grid[r2]!.length; c2++) {
              const cd = state.grid[r2]![c2]!.card;
              if (cd && cd.rank === 2) {
                return { selector: `[data-testid="hint-target-addiction-solitaire-${r2}-${c2}"]`, pulses: 3 };
              }
            }
          }
          continue;
        }
        const left = row[c - 1]!.card;
        if (!left) continue;
        const wantRank = left.rank + 1;
        if (wantRank > 13) continue;
        for (let r2 = 0; r2 < state.grid.length; r2++) {
          for (let c2 = 0; c2 < state.grid[r2]!.length; c2++) {
            const cd = state.grid[r2]![c2]!.card;
            if (cd && cd.suit === left.suit && cd.rank === wantRank) {
              return { selector: `[data-testid="hint-target-addiction-solitaire-${r2}-${c2}"]`, pulses: 3 };
            }
          }
        }
      }
    }
    if (state.redealsRemaining > 0) {
      return { selector: '[data-testid="hint-target-addiction-solitaire-redeal"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: AddictionSolitaireGame,
};
