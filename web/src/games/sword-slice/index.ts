import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwordSliceState, SwordSliceAction, SwordSliceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SwordSlice } from "./Game.js";

const settings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const swordSlicePlugin: GamePlugin<SwordSliceState, SwordSliceAction, typeof settings> = {
  id: "sword-slice",
  title: "Sword Slice",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slice targets as fast as you can! Click each target before it fades. Miss the target area and lose points.",
  howToPlay: `Sword Slice is a fast-paced click arcade game. Targets appear on a dark arena at random positions. Your job is to click (slice) each target as quickly as possible.

Each regular target is worth 10 points. Special gold-starred targets are worth 20 points — click those first if you can! Clicking on the empty arena background costs you 2 points, so aim carefully.

New targets spawn automatically every 1.5 seconds. You can have up to 5 targets on screen at once. The oldest targets disappear when new ones arrive, so don't let them pile up — click them quickly!

Use Settings to choose 20, 30, or 45 seconds. The longer the game, the higher your potential score.

The game ends when time runs out. Your final score, total slices, and miss count are displayed. Can you keep your accuracy high while clicking at top speed?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SwordSliceSettings),
  reducer, isTerminal, component: SwordSlice,
};
