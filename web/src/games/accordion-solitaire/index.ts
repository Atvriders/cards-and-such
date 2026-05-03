import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AccordionSolitaireState, AccordionSolitaireAction, AccordionSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AccordionSolitaireGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AccordionSolitaireGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const accordionSolitairePlugin: GamePlugin<AccordionSolitaireState, AccordionSolitaireAction, typeof settings> = {
  id: "accordion-solitaire",
  title: "Accordion",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Accordion: collapse adjacent cards that share suit or rank.",
  howToPlay: "Accordion: collapse adjacent cards that share suit or rank. Click a card, then click another that's exactly one or three positions to its left and shares either suit or rank. The two collapse — get down to a single card to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AccordionSolitaireSettings),
  hint: (state: AccordionSolitaireState): HintTarget | null => {
    if (state.won) return null;
    const live = state.cards.filter((c): c is NonNullable<typeof c> => c !== null);
    for (let i = 0; i < live.length; i++) {
      for (const dist of [1, 3]) {
        const j = i - dist;
        if (j < 0) continue;
        const a = live[i]!;
        const b = live[j]!;
        if (a.suit === b.suit || a.rank === b.rank) {
          return { selector: `[data-testid="hint-target-accordion-solitaire-${i}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: AccordionSolitaireGame,
};
