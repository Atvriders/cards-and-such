import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaristaRushState, BaristaRushAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BaristaRushGame } from "./Game.js";

export const baristaRushSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type BaristaRushSettingsType = SettingsOf<typeof baristaRushSettings>;

export const baristaRushPlugin: GamePlugin<BaristaRushState, BaristaRushAction, typeof baristaRushSettings> = {
  id: "barista-rush",
  title: "Barista Rush",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill drink orders against the clock. Pick the right size, type, and optional extra before time expires.",
  howToPlay: `Barista Rush drops you into a busy coffee shop where orders come in faster than you can make them. A queue of drink orders sits at the top of the screen, each showing a countdown timer. Your job is to build the drink at the bottom of the screen and serve it before time runs out.

Each drink has three properties: size (S, M, or L), type (espresso, latte, cappuccino, or americano), and an optional extra (sugar, milk, decaf, or none). Use the button panels to select the matching size, type, and extra, then press Serve.

Orders are served in queue order — the highlighted card at the left is always the current target. You score time-based points for a correct serve: the more time left on the order, the higher the reward. A wrong drink scores nothing and counts as a failure.

If you let an order's timer hit zero it automatically fails and a new order replaces it. Keep your eye on urgent orders (blinking red) — they need to be served soon or you will lose points.

Speed settings change how fast timers count down and how long your shift is. Slow mode gives 120 seconds with 25-second order timers, Normal is 90 seconds with 18-second timers, and Fast is 60 seconds with 12-second timers.

Tip: learn the keyboard pattern for the most common combos. Many players scan the whole queue first and look for easy orders (just size + type, no extra) before diving into complex ones.`,
  settings: baristaRushSettings,
  initialState: (seed: number, settings: BaristaRushSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-barista-rush-action"]', pulses: 3 }; },
  component: BaristaRushGame,
};
