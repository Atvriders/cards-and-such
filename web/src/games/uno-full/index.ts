import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { UnoFullState, UnoFullAction } from "./state.js";
import { initialState, reducer, isTerminal, isPlayable, isWild } from "./state.js";

const UnoFullLazy = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.UnoFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const unoFullSettings = {
  targetScore: {
    kind: "enum" as const,
    label: "Match target score",
    options: ["200", "500", "1000"] as const,
    default: "500" as const,
  },
  challengeWildD4: {
    kind: "boolean" as const,
    label: "Allow challenge on Wild +4 (omitted; flag only)",
    default: false,
  },
} as const;

export const unoFullPlugin: GamePlugin<UnoFullState, UnoFullAction, typeof unoFullSettings> = {
  id: "uno-full",
  title: "UNO (Full Official Rules)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Match by color or number, stack Draw 2s, scream UNO at one card left.",
  howToPlay: `Empty your hand before the bots do, then collect the points still in their hands. First to the target score wins the match.

The deck: 108 cards — four colors (Red, Yellow, Green, Blue), each with one 0, two each of 1–9, Skip, Reverse, and Draw-Two, plus four Wilds and four Wild Draw-Fours.

How to play: On your turn, play any card that matches the top discard by color, by number, or by symbol. Wilds may be played any time — you then declare the new active color.

Action cards: Skip — next player loses their turn. Reverse — flips direction. Draw-Two — next player draws two and is skipped. Wild Draw-Four — next player draws four and is skipped.

Drawing: If you can't play, click Draw. If the drawn card is playable, you may play it or pass; otherwise you pass automatically.

UNO: When you have one card left, hit the UNO button before the next player's turn begins. Forgetting earns a 4-card penalty.

Scoring: When a round ends, the winner scores the sum of points still held by opponents (numbers = face value, action cards = 20, wilds = 50). First to the target wins.

Advanced rules omitted: stacking Draw-Twos onto Draw-Twos and the Wild +4 challenge rule are not implemented.`,
  settings: unoFullSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: UnoFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase !== "playing") {
      if (state.phase === "pickColor") {
        return { selector: '.uf-color-btn', pulses: 3 };
      }
      return null;
    }
    if (state.turn !== 0) return null;
    const hand = state.hands[0] ?? [];
    const top = state.discard[state.discard.length - 1]!;
    // 1) Prefer matching number (non-wild)
    const numMatch = hand.find((c) => !isWild(c) && c.value === top.value && isPlayable(c, top, state.activeColor));
    if (numMatch) return { selector: `[data-testid="hint-target-uno-full-${numMatch.id}"]`, pulses: 3 };
    // 2) Else any non-wild playable card matching active color
    const colorMatch = hand.find((c) => !isWild(c) && c.color === state.activeColor);
    if (colorMatch) return { selector: `[data-testid="hint-target-uno-full-${colorMatch.id}"]`, pulses: 3 };
    // 3) Else any wild
    const wild = hand.find((c) => isWild(c));
    if (wild) return { selector: `[data-testid="hint-target-uno-full-${wild.id}"]`, pulses: 3 };
    // 4) Else draw
    if (state.drewThisTurn) {
      return { selector: '[data-testid="hint-target-uno-full-pass"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-uno-full-draw"]', pulses: 3 };
  },
  component: UnoFullLazy,
};
