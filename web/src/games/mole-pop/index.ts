import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MolePopState, MolePopAction, MolePopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MolePop } from "./Game.js";

const molePopSettings = {
  moles: { kind: "enum" as const, label: "Moles", options: ["10", "20"] as const, default: "10" as const },
} as const;

type MolePopSettingsType = SettingsOf<typeof molePopSettings>;

export const molePopPlugin: GamePlugin<MolePopState, MolePopAction, typeof molePopSettings> = {
  id: "mole-pop",
  title: "Mole Pop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A mole pops up in one of six holes — whack it before it ducks back down! Faster whacks score more points.",
  howToPlay: `Mole Pop is a classic reaction arcade game. Six holes are arranged in a 2-by-3 grid. One mole pops up in a random hole and you must click it before it disappears.

A timer bar at the top shows how long the mole will stay visible — when the bar empties, the mole ducks down and a new one appears in a different hole. Click the wrong hole and it counts as a miss.

Faster clicks earn more points: whacking quickly after the mole appears earns extra bonus points on top of the base 10. The longer you wait, the fewer points you get.

Moles appear for varying durations and change position randomly each round. Watch all six holes and react fast!

Use Settings to choose 10 or 20 moles per game. Your score is the total of all successful whacks. Can you whack every mole before it escapes?`,
  settings: molePopSettings,
  initialState: (seed: number, settings: MolePopSettingsType) => initialState(seed, settings as MolePopSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-mole-pop-action"]', pulses: 3 }; },
  component: MolePop,
};
