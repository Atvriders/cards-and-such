import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhistState, WhistAction, WhistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { defaultRankOrder, legalPlays } from "../_shared/trick-engine.js";
import { WhistGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const whistPlugin: GamePlugin<WhistState, WhistAction, typeof settings> = {
  id: "whist",
  title: "Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Whist — 13 tricks, last card sets trump.",
  howToPlay: "Whist — 13 tricks, last card sets trump. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as WhistSettings),
  reducer,
  isTerminal,
  hint: (state: WhistState): HintTarget | null => {
    if (state.phase !== "playing" || state.turn !== 0) return null;
    const hand = state.hands[0]!;
    if (hand.length === 0) return null;
    const legal = legalPlays(hand, state.trick);
    if (legal.length === 0) return null;
    const trick = state.trick;
    const led = trick.length > 0 ? trick[0]!.card.suit : null;
    const trump = state.trump;
    // If we led, play the highest. If following, try to win cheaply
    // (lowest card that beats the trick); otherwise dump lowest.
    if (trick.length === 0) {
      const pick = legal.reduce((best, c) =>
        defaultRankOrder(c.rank) > defaultRankOrder(best.rank) ? c : best,
      );
      return { selector: `[data-testid="hint-target-whistc-${pick.id}"]`, pulses: 3 };
    }
    const ledCards = legal.filter(c => c.suit === led);
    if (ledCards.length > 0) {
      // Beat the highest of led suit on table if possible.
      const onTable = trick.filter(t => t.card.suit === led).map(t => t.card);
      const highOn = onTable.reduce((hi, c) =>
        defaultRankOrder(c.rank) > defaultRankOrder(hi.rank) ? c : hi,
      );
      const winners = ledCards.filter(c => defaultRankOrder(c.rank) > defaultRankOrder(highOn.rank));
      if (winners.length > 0) {
        const pick = winners.reduce((lo, c) =>
          defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
        );
        return { selector: `[data-testid="hint-target-whistc-${pick.id}"]`, pulses: 3 };
      }
      // Can't win — dump lowest of led suit.
      const pick = ledCards.reduce((lo, c) =>
        defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
      );
      return { selector: `[data-testid="hint-target-whistc-${pick.id}"]`, pulses: 3 };
    }
    // Off-suit — try lowest trump to ruff, else lowest card.
    const trumps = legal.filter(c => c.suit === trump);
    const pool = trumps.length > 0 ? trumps : legal;
    const pick = pool.reduce((lo, c) =>
      defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
    );
    return { selector: `[data-testid="hint-target-whistc-${pick.id}"]`, pulses: 3 };
  },
  component: WhistGame,
};
