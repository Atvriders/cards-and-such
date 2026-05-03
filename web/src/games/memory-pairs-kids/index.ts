import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MemoryState, MemoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MemoryPairsKids = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MemoryPairsKids as unknown as React.ComponentType<unknown> })));
export const memoryPairsKidsSettings = {
  pairs: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["6", "8"] as const,
    default: "6" as const,
  },
} as const;

type MemoryPairsSettings = SettingsOf<typeof memoryPairsKidsSettings>;

export const memoryPairsKidsPlugin: GamePlugin<MemoryState, MemoryAction, typeof memoryPairsKidsSettings> = {
  id: "memory-pairs-kids",
  title: "Memory Pairs (Kids)",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards to find matching animal pairs — a classic memory game for kids!",
  howToPlay: `Memory Pairs is a classic flip-and-match game for young players. A grid of face-down cards is laid out in front of you. Each card hides a cute animal or symbol, and every symbol appears exactly twice in the deck.

On your turn, click any face-down card to flip it over and reveal the symbol. Then click a second face-down card. If the two symbols match, both cards stay face-up and you have found a pair! If they do not match, click "Flip Back" (or tap the button) to hide them again — but remember where they were!

The goal is to match all pairs with as few moves as possible. Your move count is shown at the top of the screen. A lower move count means a better score.

You can play with 6 pairs (12 cards) for a quick game, or 8 pairs (16 cards) for a bigger challenge. The cards are shuffled randomly each game, so every round is different.

Keep a sharp memory and you will clear the board quickly. Good luck!`,
  settings: memoryPairsKidsSettings,
  initialState: (seed: number, settings: MemoryPairsSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: MemoryState): HintTarget | null => {
    if (state.locked) return null;
    // Pulse the first face-down, unmatched card.
    for (let i = 0; i < state.cards.length; i++) {
      const c = state.cards[i]!;
      if (!c.faceUp && !c.matched) {
        return { selector: `[data-testid="hint-target-memory-pairs-kids-${i}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: MemoryPairsKids,
};
