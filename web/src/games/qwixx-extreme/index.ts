import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxExtremeState, QwixxExtremeAction, QwixxExtremeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxExtremeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const qwixxExtremePlugin: GamePlugin<QwixxExtremeState, QwixxExtremeAction, typeof settings> = {
  id: "qwixx-extreme",
  title: "Qwixx: Extreme",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aggressive Qwixx variant; high-stakes lock penalties.",
  howToPlay: "Qwixx: Extreme is a high-stakes Qwixx variant where lock penalties punish hesitation more harshly. Cross cells fast or lose rows.\n\nEach round, click Roll to generate a die (1-6). Click any empty cell to mark it. Skip when no cell suits, but be warned — every skipped round is progress lost.\n\nScoring:\n- Each cell scores its pip (1-6).\n- +5 per row complete (extreme lock).\n- +5 per column complete (extreme combo).\n- +10 for full sheet (extreme perfection).\n\n12 rolls total. Extreme rewards aggressive play: pick cells decisively, even on low rolls. Hesitation lets the rolls run out before bonuses trigger. Strategy: lock the easiest row first (the one closest to completion) to bank +5; then chase column completion with remaining rolls. A run scores 35-55; aggressive extreme play reaches 65+. Qwixx: Extreme is for players who want pressure without complexity. Twelve rolls. Sixteen cells. No mercy. Cross or be crossed.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QwixxExtremeSettings),
  reducer,
  isTerminal,
  component: QwixxExtremeGame,
};
