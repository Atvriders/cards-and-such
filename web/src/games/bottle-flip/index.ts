import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BottleFlipState, BottleFlipAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BottleFlip = /* @__PURE__ */ lazy(() => import("./BottleFlip.js").then((mod) => ({ default: mod.BottleFlip as unknown as React.ComponentType<unknown> })));
export const bottleFlipSettings = {} as const;

type BottleFlipSettingsType = SettingsOf<typeof bottleFlipSettings>;

export const bottleFlipPlugin: GamePlugin<BottleFlipState, BottleFlipAction, typeof bottleFlipSettings> = {
  id: "bottle-flip",
  title: "Bottle Flip",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip a bottle and land it upright — time your toss perfectly!",
  howToPlay: `Bottle Flip challenges you to land a bottle perfectly upright through 8 rounds of increasingly tense flips.

Watch the power meter sweep back and forth at the bottom of the screen. The meter indicates how much spin you will give the bottle — too little and it won't complete a full rotation, too much and it will over-spin past the landing zone. The sweet spot is usually somewhere in the middle, around 40–70% power.

Press Space or tap the Flip button to launch the bottle. The bottle arcs upward, spinning rapidly, and must land in an upright position (within 30 degrees of vertical) to count as a successful flip.

Successful landings earn 10 points for your first flip, and each consecutive successful flip adds 5 bonus points — so a streak of three earns 10, 15, and 20 points respectively. Missing a landing resets your streak bonus back to zero.

Tips for success: Watch the power bar carefully and try to release at a consistent percentage each round. A perfect flip lands the bottle with very little wobble. If you're over-rotating, try lower power. If the bottle doesn't complete the spin, increase your power slightly. Consistency is more rewarding than trying for extreme spin — find your rhythm and trust it.`,
  settings: bottleFlipSettings,
  initialState: (_seed: number, _settings: BottleFlipSettingsType) => initialState(),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bottle-flip-action"]', pulses: 3 }; },
  component: BottleFlip,
};
