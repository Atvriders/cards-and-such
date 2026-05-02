import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanisterState, CanisterAction } from "./state.js";
import { initialState, reducer, isTerminal, canisterRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Canister } from "./Canister.js";

export const canisterSettings = {} as const;

type CanisterSettings = SettingsOf<typeof canisterSettings>;

export const canisterPlugin: GamePlugin<CanisterState, CanisterAction, typeof canisterSettings> = {
  id: "canister",
  title: "Canister",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One deck, 8 columns all face-up, no stock. Build down alternating colors to foundations.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: All 52 cards are dealt face-up into eight tableau columns — four columns of seven cards and four columns of six cards. There is no stock pile and no redeal. The four foundations are empty and must be built up in suit from Ace to King.

Tableau: Build down in alternating colors, exactly like Klondike — a red card must land on a black card one rank higher, and vice versa. Valid alternating-color descending sequences may be moved as groups. Empty columns accept any card or sequence.

Since all cards are face-up at the start, you have full information — every card is visible from the beginning. There is no draw pile to rescue you: this is a pure puzzle of rearrangement.

Scoring: +10 per card placed on a foundation.

Strategy: With full information, plan several moves ahead before committing. Look for buried Aces and 2s and plan routes to free them first. Manage empty columns carefully — they are limited and invaluable for maneuvering long sequences. Build foundations steadily across all four suits to avoid blocking yourself.`,
  settings: canisterSettings,
  initialState: (seed: number, settings: CanisterSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CanisterState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, canisterRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Canister,
};
