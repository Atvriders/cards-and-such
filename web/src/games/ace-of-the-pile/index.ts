import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AceOfThePileState, AceOfThePileAction } from "./state.js";
import { initialState, reducer, isTerminal, aotpRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { AceOfThePile } from "./AceOfThePile.js";

export const aceOfThePileSettings = {} as const;

type AceOfThePileSettings = SettingsOf<typeof aceOfThePileSettings>;

export const aceOfThePilePlugin: GamePlugin<AceOfThePileState, AceOfThePileAction, typeof aceOfThePileSettings> = {
  id: "ace-of-the-pile",
  title: "Ace of the Pile",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A quick same-suit solitaire with 6 open columns and one reserve card.",
  howToPlay: `Ace of the Pile is a compact, fast-playing solitaire. All tableau cards are visible from the start, giving you full information to plan a solution.

Setup: Six tableau columns each hold 4 face-up cards — 24 cards. One card is placed in the reserve slot. The remaining 27 cards are queued in the reserve and become available one at a time as each current reserve card is played. Four foundations start empty.

Goal: Move all 52 cards to the four foundations built up from Ace to King in the same suit.

Tableau rules: Build columns down in the same suit — rank must decrease by one and suit must match exactly. For example, 8♠ accepts only 7♠. Only single-card moves are allowed. Empty columns accept any single card.

Reserve: The top reserve card can be played to any foundation or any legal tableau position. A new card becomes available after the current one is played.

Tips: Plan sequences ahead since same-suit building is quite restrictive — only one out of four cards can extend any given column. Aim to free Aces first by working backward from the card blocking each Ace. Keep at least one column empty when possible to use as a temporary buffer when rearranging.`,
  settings: aceOfThePileSettings,
  initialState: (seed: number, _settings: AceOfThePileSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: AceOfThePileState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, aotpRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: AceOfThePile,
};
