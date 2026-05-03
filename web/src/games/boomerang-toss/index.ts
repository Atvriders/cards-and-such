import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoomerangTossState, BoomerangTossAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BoomerangToss = /* @__PURE__ */ lazy(() => import("./BoomerangToss.js").then((mod) => ({ default: mod.BoomerangToss as unknown as React.ComponentType<unknown> })));
export const boomerangTossSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Speed",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type BoomerangTossSettingsType = SettingsOf<typeof boomerangTossSettings>;

export const boomerangTossPlugin: GamePlugin<BoomerangTossState, BoomerangTossAction, typeof boomerangTossSettings> = {
  id: "boomerang-toss",
  title: "Boomerang Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Throw a boomerang through hoops and catch it on the return for points!",
  howToPlay: `Boomerang Toss is an action arcade game where you hurl a boomerang across the sky, guide it through floating hoops, and catch it when it curves back to you.

Each throw begins in aim mode. The field shows three coloured rings scattered around the sky — your targets. Click anywhere on the field to launch the boomerang. It arcs out in a wide curved path, then loops back to your thrower. The path follows a classic boomerang trajectory: it curves outward and then sweeps back.

Score points by flying through rings: 50 points for each ring the boomerang passes through. If the boomerang completes its arc and returns to the thrower you earn an extra 20 catch bonus. Rings are refreshed with each new throw.

You have five throws per game. After the boomerang returns or misses, click to begin the next throw. Plan your click placement to route the boomerang through as many rings as possible.

On easy difficulty the boomerang travels slowly, giving you time to track it. Hard mode sends it screaming through the air. The rings are always randomly placed so no two games are alike. Maximum possible score is 350 points — five perfect throws each catching all three rings plus the catch bonus.`,
  settings: boomerangTossSettings,
  initialState: (seed: number, settings: BoomerangTossSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".boomerang-field", pulses: 3 }; },
  component: BoomerangToss,
};
