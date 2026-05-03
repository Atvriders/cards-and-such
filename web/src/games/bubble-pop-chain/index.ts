import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BubblePopState, BubblePopAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BubblePopChain } from "./Game.js";

const bubblePopSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

type BubblePopSettingsType = SettingsOf<typeof bubblePopSettings>;

export const bubblePopChainPlugin: GamePlugin<BubblePopState, BubblePopAction, typeof bubblePopSettings> = {
  id: "bubble-pop-chain",
  title: "Bubble Pop Chain",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pop chains of same-color bubbles before they overflow off the bottom.",
  howToPlay: `A grid of colored bubbles slowly fills up from above. Every few seconds a new row of bubbles is added at the top, pushing everything down. If any bubble reaches the bottom row the game ends.

Click on any bubble that is part of a chain of two or more connected same-color bubbles. Connected means directly adjacent — left, right, above, or below (not diagonal). The entire connected group pops and disappears, opening up space.

Scoring is based on chain size: popping exactly 2 scores 20 points, but chains of 3 score 60, chains of 5 score 150, and larger chains give even bigger bonuses. Always look for the largest chain before clicking.

The number of colors affects difficulty: 3 colors means bigger clusters form naturally, making the game easier; 5 colors creates smaller, more scattered groups that are harder to chain.

Tips: Don't just pop the first group you see. Scan the board for the largest cluster. Sometimes a single strategic pop opens up adjacent bubbles of the same color, creating a chain reaction opportunity on your next click. Try to clear the bottom rows first to buy more time. Watch the timer bar — when it's almost full, a new row is about to drop.`,
  settings: bubblePopSettings,
  initialState: (seed: number, settings: BubblePopSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bubble-pop-chain-action"]', pulses: 3 }; },
  component: BubblePopChain,
};
