import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleWarriorState, type IdleWarriorAction } from "./state.js";
const IdleWarrior = /* @__PURE__ */ lazy(() => import("./IdleWarrior.js").then((mod) => ({ default: mod.IdleWarrior as unknown as React.ComponentType<unknown> })));
export const idleWarriorSettings = {
  enemies: { kind: "enum" as const, label: "Enemies to Defeat", options: ["20", "50", "100"] as const, default: "20" as const },
} as const;

export const idleWarriorPlugin: GamePlugin<IdleWarriorState, IdleWarriorAction, typeof idleWarriorSettings> = {
  id: "idle-warrior",
  title: "Idle Warrior",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Strike enemies, recruit soldiers, train your attack — idle your way to victory.",
  howToPlay: `Idle Warrior casts you as a hero building an army. You must defeat a set number of enemies — 20, 50, or 100 depending on your difficulty — through active strikes and passive soldiers.

Click the sword button to strike enemies manually. Each strike deals damage equal to your Attack Power and earns gold. There is a 15% chance of a Critical Strike that triples your damage for that blow.

Spend gold to Recruit Soldiers. Each soldier automatically defeats one enemy per second in the background, letting your army fight while you focus on active clicking.

You can also spend gold to Train your hero — each training session increases your personal Attack Power by 1, making every strike you land more devastating.

The progress bar tracks enemies defeated toward your goal. Defeating all enemies ends the game and calculates your final score based on gold earned, soldiers recruited, and attack power.

Strategy tip: recruit your first soldier early to start passive income, then split gold between more soldiers and training. With a high Attack Power, your Critical Strikes become massive, and a large army will grind through enemies automatically while you click for critical bonuses.`,
  settings: idleWarriorSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".iwar-strike-btn", pulses: 3 }),
  component: IdleWarrior,
};
