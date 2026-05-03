import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SlimeDefenseState, SlimeDefenseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SlimeDefense = /* @__PURE__ */ lazy(() => import("./SlimeDefense.js").then((mod) => ({ default: mod.SlimeDefense as unknown as React.ComponentType<unknown> })));
export const slimeDefenseSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal",
  },
} as const;

type SlimeDefenseSettingsType = SettingsOf<typeof slimeDefenseSettings>;

export const slimeDefensePlugin: GamePlugin<SlimeDefenseState, SlimeDefenseAction, typeof slimeDefenseSettings> = {
  id: "slime-defense",
  title: "Slime Defense",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place traps across 5 lanes to stop waves of colourful slimes from reaching your base.",
  howToPlay: `Slime Defense is a lane-based arcade defense game. Slimes spawn at the top of five lanes and ooze downward toward your base at the bottom. If enough slimes reach the base, it loses HP — run out of base HP and the game ends.

Slimes come in three colours with different toughness. Green slimes have 1 HP and are easy to pop. Blue slimes have 2 HP and require a trap to have been active for two ticks to eliminate. Red slimes have 4 HP and are the biggest threat — they cost extra points to eliminate.

To defend, click a lane to select it (highlighted in gold), then click Place Trap. A trap costs 4 gold and permanently damages every slime passing through that lane by 1 HP per game tick. You earn 1 gold per tick passively.

Traps are permanent once placed, so plan carefully: spread them across lanes to handle random spawns, then use later gold to fill gaps. Eliminating slimes earns 5 points for green/blue and 20 for red.

Difficulty controls spawn rate and slime speed. On Hard, slimes move faster and waves escalate quickly — you need efficient trap coverage from the start.

Score is based on total slimes eliminated (capped at 100). Prioritise high-traffic lanes and always keep enough gold for the next trap.`,
  settings: slimeDefenseSettings,
  initialState: (seed: number, settings: SlimeDefenseSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-slime-defense-action"]', pulses: 3 }; },
  component: SlimeDefense,
};
