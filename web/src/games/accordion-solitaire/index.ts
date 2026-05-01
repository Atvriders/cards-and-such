import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AccordionSolitaireState, AccordionSolitaireAction, AccordionSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AccordionSolitaireGame } from "./Game.js";

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
  reducer,
  isTerminal,
  component: AccordionSolitaireGame,
};
