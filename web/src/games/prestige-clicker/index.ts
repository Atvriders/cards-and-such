import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PrestigeClickerState, type PrestigeClickerAction } from "./state.js";
const PrestigeClicker = /* @__PURE__ */ lazy(() => import("./PrestigeClicker.js").then((mod) => ({ default: mod.PrestigeClicker as unknown as React.ComponentType<unknown> })));
export const prestigeClickerSettings = {
  prestigeGoal: { kind: "enum" as const, label: "Points to Prestige", options: ["1000", "5000", "25000"] as const, default: "1000" as const },
} as const;

export const prestigeClickerPlugin: GamePlugin<PrestigeClickerState, PrestigeClickerAction, typeof prestigeClickerSettings> = {
  id: "prestige-clicker",
  title: "Prestige Clicker",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click to accumulate points, prestige to multiply — reach full prestige after 3 resets.",
  howToPlay: `Prestige Clicker is an idle game with a twist: the real power comes from resetting. Click the star to earn points, buy Auto Clickers for passive income, and when you hit the prestige goal — reset everything for a permanent multiplier.

Each time you Prestige, your points reset to zero and your Auto Clickers are removed. But your Prestige Multiplier permanently doubles — meaning every click and every auto-clicker earns twice as much as before. Your Click Power also increases by 2 with each prestige, stacking multiplicatively.

The game ends after you complete three full prestiges and reach the goal one final time. Reaching the goal before prestiging wins the game on the third prestige.

Auto Clickers tick every second and are affected by the prestige multiplier. Buy them aggressively since they reset anyway on prestige — there is no reason to hoard points before hitting the goal.

The prestige multiplier stacks as a power of 2: after one prestige you earn 2x everything, after two prestiges 4x, and after three prestiges 8x. The exponential acceleration makes the final run dramatically faster than the first.

Strategy tip: buy as many Auto Clickers as possible on each run, prestige the moment you hit the goal, and enjoy watching the numbers grow bigger with every cycle.`,
  settings: prestigeClickerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".pc-click-btn", pulses: 3 }),
  component: PrestigeClicker,
};
