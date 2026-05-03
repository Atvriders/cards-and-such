import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { swishJrCardsState, swishJrCardsAction, swishJrCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const swishJrCardsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.swishJrCardsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const swishJrCardsPlugin: GamePlugin<swishJrCardsState, swishJrCardsAction, typeof settings> = {
  id: "swish-jr-cards",
  title: "Swish Jr.",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified Swish — overlay transparent cards to match circle patterns.",
  howToPlay: "Swish Jr. is the children's version of Swish, distilled to fifteen card-overlay matching rounds. Each round shows a partial overlay and asks you to identify which card-pair stack completes the swish.\n\nThe pool of card-overlay challenges includes Two circles align in middle, Three circles form triangle, Two arcs touch at edges, and other simple Swish layouts. Each correct answer scores ten points; max 150.\n\nClick a card-pair, press Submit to lock, then Next to advance. The original Swish Jr. is a simpler version of Swish with fewer cards and easier overlays designed for children; this distillation preserves the visual-overlay puzzle without the physical card stack. Strong overlay-spotters score 130+; children with sharp eyes hit perfect 150.\n\nUse it as a kid-friendly visual-spatial warmup or as a quick brain-twist for any age. The key skill is visualising one transparent card laid atop another and mentally checking whether circles align.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as swishJrCardsSettings),
  reducer,
  isTerminal,
  
  hint: (state: swishJrCardsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-swish-jr-cards-answer-0"]', pulses: 3 } : null,component: swishJrCardsGame,
};
