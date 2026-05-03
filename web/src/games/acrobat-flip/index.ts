import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcrobatFlipState, AcrobatFlipAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcrobatFlip } from "./AcrobatFlip.js";

export const acrobatFlipSettings = {
  flips: {
    kind: "enum" as const,
    label: "Flips",
    options: ["5", "8", "12"] as const,
    default: "8" as const,
  },
} as const;

type AcrobatFlipSettingsType = SettingsOf<typeof acrobatFlipSettings>;

export const acrobatFlipPlugin: GamePlugin<AcrobatFlipState, AcrobatFlipAction, typeof acrobatFlipSettings> = {
  id: "acrobat-flip",
  title: "Acrobat Flip",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time your landing to stop the spinning arrow in the target zone for a perfect flip.",
  howToPlay: `Acrobat Flip is a timing arcade game where you play an acrobat performing aerial flips. A spinning arrow rotates around a circle. A yellow zone marks the good landing area and a green zone marks the perfect landing spot. Your goal is to press Land at exactly the right moment to stop the arrow in the target zone.

Each flip has a new randomised target zone position. Press Spin to advance the arrow one tick at a time — the arrow moves 17 degrees per tick. Watch the arrow approach the green zone, then press Land to freeze it.

Landing quality depends on how close the arrow is to the centre of the target:
- Perfect (green zone, within 10 degrees): 100 points
- Good (yellow zone, within 25 degrees): 60 points
- OK (within 45 degrees): 30 points
- Miss (outside 45 degrees): 0 points

The game runs for 5, 8, or 12 flips depending on your chosen setting. Your total score is the sum of all landing points, capped at 1000. A perfect score of 1200 on 12 flips is reduced to 1000.

Tips: spin the arrow slowly towards the target and stop just before the green zone so you can Land precisely. The arrow moves in fixed steps so you can predict exactly where it will stop. Overshoot is common — when the arrow is one tick away from the perfect zone, press Land immediately.`,
  settings: acrobatFlipSettings,
  initialState: (seed: number, settings: AcrobatFlipSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-acrobat-flip-action"]', pulses: 3 }; },
  component: AcrobatFlip,
};
