import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleBlacksmithState, type IdleBlacksmithAction } from "./state.js";
const IdleBlacksmith = /* @__PURE__ */ lazy(() => import("./IdleBlacksmith.js").then((mod) => ({ default: mod.IdleBlacksmith as unknown as React.ComponentType<unknown> })));
export const idleBlacksmithSettings = {
  goal: { kind: "enum" as const, label: "Iron Goal", options: ["200", "1000", "5000"] as const, default: "200" as const },
} as const;

export const idleBlacksmithPlugin: GamePlugin<IdleBlacksmithState, IdleBlacksmithAction, typeof idleBlacksmithSettings> = {
  id: "idle-blacksmith",
  title: "Idle Blacksmith",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Man the forge, hire helpers, install anvils — smelt your way to iron mastery.",
  howToPlay: `Idle Blacksmith puts you at a roaring forge. Your task is to smelt a target amount of iron — 200, 1,000, or 5,000 depending on difficulty — by working the forge and building up your smithy.

Click the hammer to forge iron manually. Each strike earns iron equal to your Forge Power, and there is a 6% chance of a Masterwork strike that doubles your yield for that hit.

Hire Helpers to boost your operation. Each helper adds 1 iron per second of passive production and raises your Forge Power by 2 — making your manual strikes more valuable as well.

Buy Anvils to boost your passive production further. Each Anvil adds 2 iron per second automatically, stacking with your helpers. Anvils are more expensive than helpers but produce twice as much passive income.

The progress bar shows how close you are to the iron goal. When you reach it, you earn a score based on total iron plus bonuses for helpers and anvils accumulated.

Strategy tip: buy your first helper quickly, then alternate between helpers and anvils. The combination of higher Forge Power (from helpers) and pure passive output (from anvils) will flood the smithy with iron faster than either alone.`,
  settings: idleBlacksmithSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".ibs-forge-btn", pulses: 3 }),
  component: IdleBlacksmith,
};
