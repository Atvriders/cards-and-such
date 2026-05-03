import { lazy } from "react";
import type * as React from "react";
import type { PairsThemedState, PairsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PairsThemed = /* @__PURE__ */ lazy(() => import("./PairsThemed.js").then((mod) => ({ default: mod.PairsThemed as unknown as React.ComponentType<unknown> })));
export const pairsThemedSettings = {
  theme: {
    kind: "enum" as const,
    label: "Theme",
    options: ["animals", "flags", "planets", "music"] as const,
    default: "animals" as const,
  },
  size: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["12", "16", "24", "36"] as const,
    default: "16" as const,
  },
} as const;

export const pairsThemedPlugin = {
  id: "pairs-themed",
  title: "Pairs",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip-and-match memory game with themed emoji sets — animals, flags, planets, or music.",
  howToPlay: `Find every matching pair of cards by remembering what you have already seen. Choose a theme (Animals, Flags, Planets, or Music) and a grid size (12, 16, 24, or 36 pairs) in Settings before starting.

All cards begin face-down. Click any face-down card to flip it over and reveal its emoji symbol. Then click a second face-down card. If both cards show the same emoji they stay face-up for the rest of the game — that pair is matched! If they do not match, both cards flip back face-down after a brief pause so you can try to remember their positions.

Continue until all pairs are found. You win when every card is matched face-up.

Score is max(100, pairs × 200 − extra_attempts × 20), where extra attempts are any clicks beyond the theoretical minimum of one click per pair. Perfect play — every second card you flip matches the first — gives the maximum score.

Tips: Flip cards in a systematic left-to-right, top-to-bottom order on your first pass to build a complete mental map. When you flip a card you have previously seen, immediately flip its known partner. Larger grids with more exotic themes reward patience and a good memory.`,
  settings: pairsThemedSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: PairsThemedState) => !state.won ? { selector: '.pairs-grid', pulses: 3 } : null,
  component: PairsThemed,
};
