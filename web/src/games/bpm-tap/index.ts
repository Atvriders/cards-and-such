import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BpmTapState, type BpmTapAction } from "./state.js";
import { BpmTap } from "./BpmTap.js";

export const bpmTapSettings = {
  target: { kind: "enum" as const, label: "Target BPM", options: ["60", "120", "180"] as const, default: "60" as const },
} as const;

export const bpmTapPlugin: GamePlugin<BpmTapState, BpmTapAction, typeof bpmTapSettings> = {
  id: "bpm-tap",
  title: "BPM Tap",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap a button to match a target BPM. How steady is your rhythm?",
  howToPlay: `BPM Tap challenges your sense of rhythm. A target tempo is shown — 60, 120, or 180 beats per minute. Your job: tap the big TAP button in time with that beat.

The game measures the interval between your taps and converts it to BPM in real time. After your second tap, your current estimated BPM is displayed. Green means you're close (within 3 BPM), orange means you're off.

Tap 8 times total. The game tracks your best (most accurate) measurement across all tap pairs. Your score is based on how close your best reading came to the target BPM — a perfect match scores 1000 points, and you lose 10 points per BPM you're off.

Tips for accuracy: count in your head before tapping. For 60 BPM, imagine a second hand ticking — one tap per second. For 120 BPM, tap twice as fast. For 180 BPM, think quick walking pace.

Don't rush your early taps — it takes a few to settle into the rhythm. Your later taps (after the beat clicks in) will be more accurate than your first two. The game only cares about your best reading, so finding the groove is more important than being perfect from the start.`,
  settings: bpmTapSettings,
  initialState,
  reducer,
  isTerminal,
  component: BpmTap,
};
