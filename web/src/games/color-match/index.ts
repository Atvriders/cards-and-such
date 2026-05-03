import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorMatchState, ColorMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorMatch } from "./ColorMatch.js";

export const colorMatchSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60"] as const,
    default: "60" as const,
  },
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type ColorMatchSettingsType = SettingsOf<typeof colorMatchSettings>;

export const colorMatchPlugin: GamePlugin<ColorMatchState, ColorMatchAction, typeof colorMatchSettings> = {
  id: "color-match",
  title: "Color Match Tap",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap when the central circle matches the target color shown in the banner.",
  howToPlay: `A large central circle cycles through different colors rapidly. A banner at the top shows your target color. Your goal is to tap the circle — or press Space — exactly when its color matches the target color shown in the banner.

Hit the circle during the right color to score one point. Tap at the wrong time and you lose one point as a penalty, so precision matters more than spam-clicking. The circle pulses with a green glow when the colors actually match, giving you a subtle visual cue.

The game runs for 30 or 60 seconds. Speed controls how quickly the circle cycles through colors. On slow the color holds for 1.5 seconds, giving plenty of time to react. On medium it changes every 0.8 seconds, requiring sharp focus. On fast the color flashes by in just 0.4 seconds, demanding near-instant reactions.

Tips: Watch both the banner and the circle at the same time using soft focus. Don't look back and forth — train your eye to distinguish the target color at a glance. When playing at fast speed, position your finger or mouse over the circle before the target color approaches in the cycle. The colors cycle in a semi-predictable sequence after a few rounds, so learning the order helps.`,
  settings: colorMatchSettings,
  initialState: (seed: number, settings: ColorMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-color-match-action"]', pulses: 3 }; },
  component: ColorMatch,
};
