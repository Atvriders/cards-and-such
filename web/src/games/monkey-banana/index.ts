import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonkeyBananaState, MonkeyBananaAction, MonkeyBananaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonkeyBanana } from "./Game.js";

const settings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const monkeyBananaPlugin: GamePlugin<MonkeyBananaState, MonkeyBananaAction, typeof settings> = {
  id: "monkey-banana",
  title: "Monkey Banana",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bananas are falling! Catch them before they hit the ground. Miss three and the monkey goes hungry!",
  howToPlay: `Monkey Banana is a catch-em arcade game. Bananas fall from the top of the screen at various positions and speeds. Click a banana to catch it before it falls to the bottom.

A standard banana is worth 10 points. Double bananas (shown as two banana emoji) fall faster and are worth 20 points — try to prioritize those! Each banana that falls off the bottom costs you one life.

You start with 3 lives. Lose all three lives and the game ends immediately. The timer also ends the game when it runs out — whichever comes first.

New bananas spawn every two seconds. Keep clicking! Up to 6 bananas can be on screen at once, so scan quickly to catch the most valuable ones before they escape.

Use Settings to choose 20, 30, or 45 seconds. Final score, catch count, and miss count are shown at the end. Can you catch every banana and keep all 3 lives?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonkeyBananaSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-monkey-banana-action"]', pulses: 3 }; },
  component: MonkeyBanana,
};
