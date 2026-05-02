import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CruelState, CruelAction } from "./state.js";
import { initialState, reducer, isTerminal, cruelRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Cruel } from "./Cruel.js";

export const cruelSettings = {} as const;

type CruelSettings = SettingsOf<typeof cruelSettings>;

export const cruelPlugin: GamePlugin<CruelState, CruelAction, typeof cruelSettings> = {
  id: "cruel",
  title: "Cruel",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One deck, 12 tableau piles, Aces pre-placed. Build down same suit — no stock.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: All four Aces are placed immediately on the foundations. The remaining 48 cards are dealt face-up into 12 tableau piles of four cards each. There is no stock and no redeal.

Foundations: Build each foundation up in suit from Ace to King (A→2→3→…→K). Only the top card of each tableau pile may be moved.

Tableau: Build down in the same suit only — a 6♠ may only be placed on a 7♠. Only single cards can be moved. Empty tableau columns cannot be filled; once a pile is cleared it stays empty.

Goal: Transfer all 48 remaining cards to the foundations by building same-suit sequences.

Strategy: This game is notoriously difficult — many deals are unwinnable. Prioritize freeing cards that unblock sequences. Look several moves ahead before moving a card to the foundation, since you cannot return it to the tableau. Try to keep at least one suit advancing steadily so you can create space. Even with optimal play, most deals cannot be completed.`,
  settings: cruelSettings,
  initialState: (seed: number, settings: CruelSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CruelState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, cruelRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Cruel,
};
