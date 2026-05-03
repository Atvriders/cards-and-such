import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleFarmerState, type IdleFarmerAction } from "./state.js";
const IdleFarmer = /* @__PURE__ */ lazy(() => import("./IdleFarmer.js").then((mod) => ({ default: mod.IdleFarmer as unknown as React.ComponentType<unknown> })));
export const idleFarmerSettings = {
  goal: { kind: "enum" as const, label: "Crop Goal", options: ["500", "2000", "10000"] as const, default: "500" as const },
} as const;

export const idleFarmerPlugin: GamePlugin<IdleFarmerState, IdleFarmerAction, typeof idleFarmerSettings> = {
  id: "idle-farmer",
  title: "Idle Farmer",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Harvest crops, hire farmers, expand your fields to reach the crop goal.",
  howToPlay: `Idle Farmer puts you in charge of a small homestead. Your goal is to grow enough crops to reach the target — 500, 2,000, or 10,000 depending on your chosen difficulty.

Click the wheat button to manually harvest crops. Each click earns crops equal to your Harvest Power multiplied by the number of Fields you own. Start with one field and expand as you earn more.

Spend crops to hire Auto Farmers. Each farmer harvests crops automatically every second, and also boosts your click power by 1. Farmers multiply with your fields, so more land means more income from each farmer.

You can also buy additional Fields. Each new field multiplies everything — your manual harvests and your auto-farmers' output all scale with field count. Fields are expensive but pay off quickly.

Watch for the occasional Bumper Crop bonus — a lucky harvest earns extra crops for free. Build up a roster of farmers and fields early, then sit back and watch the crops roll in.

Strategy tip: buy your first Field as soon as you can. The field multiplier is the single most powerful upgrade in the game. Then alternate between hiring farmers and buying more fields to keep both multipliers growing.`,
  settings: idleFarmerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".if-harvest-btn", pulses: 3 }),
  component: IdleFarmer,
};
