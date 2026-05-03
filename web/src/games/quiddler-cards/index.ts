import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuiddlerCardsState, QuiddlerCardsAction, QuiddlerCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuiddlerCardsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuiddlerCardsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: QuiddlerCardsState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-quiddler-cards-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-quiddler-cards-secondary"]', pulses: 3 };
  return null;
};

export const quiddlerCardsPlugin: GamePlugin<QuiddlerCardsState, QuiddlerCardsAction, typeof settings> = {
  id: "quiddler-cards", title: "Quiddler Cards", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Word-forming card game: high-card spells beat CPU's spells.",
  howToPlay: "Quiddler is a word-forming card game where players use letter cards to spell words. This mini-version reduces it to an 8-round letter-vs-letter spelling face-off against the CPU.\n\nEach round, you and the CPU each \"draw\" a card from a 52-deck (treated as letter values for this mini). Higher rank wins (your spelling was longer or stronger). Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 12 points. Tie awards 4 sympathy points. Loss awards zero.\n\nEight rounds total. Expected score: 55-75 points; lucky runs cross 85.\n\nThe full Quiddler comes with custom letter cards (each letter has a point value), and players compete to spell long words from their dealt hands. This mini doesn't actually spell — it just compares the abstract \"card strength\" each round. A nod to the family of word-letter card games for players who love the genre but want a quick reflex round. Word lovers, take heart: longer letter strings (= higher cards here) always win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuiddlerCardsSettings),
  reducer, isTerminal, hint: hint, component: QuiddlerCardsGame,
};
