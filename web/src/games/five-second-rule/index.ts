import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveSecState, FiveSecAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveSecondRule } from "./Game.js";

export const fiveSecondRuleSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
  timeLimit: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["5", "7", "10"] as const,
    default: "5" as const,
  },
} as const;

type FiveSecSettingsType = SettingsOf<typeof fiveSecondRuleSettings>;

export const fiveSecondRulePlugin: GamePlugin<FiveSecState, FiveSecAction, typeof fiveSecondRuleSettings> = {
  id: "five-second-rule",
  title: "Five Second Rule",
  category: "arcade",
  players: { min: 1, max: 10, multiplayer: false },
  description: "Name 3 things in the category before time runs out!",
  howToPlay: `Five Second Rule is a rapid-fire party game of quick thinking under pressure. A category prompt appears on screen — something like "Name 3 things you find in a kitchen." You have only 5 seconds to shout out three answers. Sounds easy, but the clock has a way of blanking your brain!

The timer counts down on screen. When you think of all three, tap Got It! to score a point. If you can't manage it in time (or give up), tap Pass and try again next round.

For groups: pass the device to one person per round. They must answer aloud while the group watches the timer. The group decides if their answers count. Then pass to the next player.

For solo play: challenge yourself to beat your previous score over multiple games.

The real comedy comes when someone blanks on the most obvious answers under time pressure. "Name 3 things in a kitchen" — and suddenly every pan, spoon, and fridge vanishes from your mind.

Choose 5, 7, or 10 seconds depending on difficulty, and 10 to 20 rounds depending on group size. Your score is the number of prompts you successfully named 3 items for.`,
  settings: fiveSecondRuleSettings,
  initialState: (seed: number, settings: FiveSecSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-five-second-rule-action"]', pulses: 3 }; },
  component: FiveSecondRule,
};
