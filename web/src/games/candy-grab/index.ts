import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CandyGrabState, CandyGrabAction, CandyGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CandyGrab } from "./Game.js";

const candyGrabPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof candyGrabPluginSettings>;

export const candyGrabPlugin: GamePlugin<CandyGrabState, CandyGrabAction, typeof candyGrabPluginSettings> = {
  id: "candy-grab",
  title: "Candy Grab",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Candies are raining from above! Grab them before they hit the floor — sweet points await!",
  howToPlay: `Candy Grab is a sweet arcade catching game. Colorful candies drop from the top of the screen at varying speeds and positions. Click each candy to grab it before it hits the ground!

A standard candy earns 10 points. Lollipops (bright swirly candies) fall faster and are worth 20 points — grab those first! Every candy that hits the floor costs one life.

You start with 3 lives. Lose all three and the game ends. The timer also ends the game when it runs out.

New candies spawn every two seconds. Up to 6 can be falling at once, so scan the arena constantly.

Use Settings to choose 20, 30, or 45 seconds. Final score and stats are shown at the end. Can you grab every last piece of candy?`,
  settings: candyGrabPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CandyGrabSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-candy-grab-action"]', pulses: 3 }; },
  component: CandyGrab,
};
