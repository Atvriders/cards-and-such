import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BananaPeelState, BananaPeelAction, BananaPeelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BananaPeel } from "./Game.js";

const bananaPeelPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof bananaPeelPluginSettings>;

export const bananaPeelPlugin: GamePlugin<BananaPeelState, BananaPeelAction, typeof bananaPeelPluginSettings> = {
  id: "banana-peel",
  title: "Banana Peel",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Banana peels are raining down! Click them to pick them up before someone slips on them.",
  howToPlay: `Banana Peel is a frantic clicking arcade game. Banana peels are dropping from the top of the screen at random positions and speeds. Click each peel to safely pick it up before it hits the ground and causes a slipping hazard!

A single peel earns 10 points. Double peels fall faster and are worth 20 points — target those for a score boost! Every peel that hits the ground costs one life.

You start with 3 lives. Lose all three and the game is over. The countdown timer also ends the game when it reaches zero.

New peels spawn every two seconds. Keep your eyes moving and your clicks quick! Up to 6 peels can be on screen at once.

Use Settings to choose 20, 30, or 45 seconds. Final score and stats are shown at the end. Can you prevent every slip?`,
  settings: bananaPeelPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as BananaPeelSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-banana-peel-action"]', pulses: 3 }; },
  component: BananaPeel,
};
