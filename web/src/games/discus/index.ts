import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type DiscusState, type DiscusAction } from "./state.js";
const Discus = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Discus as unknown as React.ComponentType<unknown> })));
export const discusSettings = {
  throws: { kind: "enum" as const, label: "Throws", options: ["3", "6"] as const, default: "3" as const },
} as const;

export const discusPlugin: GamePlugin<DiscusState, DiscusAction, typeof discusSettings> = {
  id: "discus",
  title: "Discus Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Master the spin cycle and release point to hurl the discus to Olympic distances.",
  howToPlay: `Discus Throw is a track and field power event. You get 3 or 6 attempts and only your best legal throw counts.

Three controls govern your technique. Spin Speed is your rotational energy — maximum spin produces maximum power. Keep it high. Release Angle sets the angle of the discus at launch; the optimal angle is around 35 degrees (50% on the slider). Too flat and the disc skips; too vertical and it stalls.

Release Point is the most critical and risky control. Timing the release late (70–90%) makes maximum use of the rotational arc and launches the discus further. However, releasing above 92% takes you out of the throwing sector — an automatic foul and no distance recorded.

Wind matters: a tailwind (→) adds metres, a headwind (←) costs distance. Read the wind indicator before each throw and aim high into a headwind or flat into a tailwind.

Scoring is based on your best legal distance relative to the 65m Olympic qualifying standard. A perfect 65m+ throw scores 1000. The men's world record is 74.08m — set by Jürgen Schult in 1986. Spin hard and release clean!`,
  settings: discusSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-discus-action"]', pulses: 3 }; },
  component: Discus,
};
