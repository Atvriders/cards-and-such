import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PirateState, PirateAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PiratesBounty = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PiratesBounty as unknown as React.ComponentType<unknown> })));
export const piratesBountyPlugin = {
  id: "pirates-bounty",
  title: "Pirate's Bounty",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sail a 5×5 grid of islands hunting seeded treasure. Limited fuel — max gold wins!",
  howToPlay: `Pirate's Bounty is a strategic treasure-hunting game on a 5×5 grid of islands. You start at the top-left island with 20 fuel and must explore islands, digging for buried treasure before your fuel runs out.

Each island shows a treasure probability — the percentage chance that digging will uncover gold. High-probability islands are more likely to reward you, but there are no guarantees. Each island has a seeded treasure value between 20 and 100 gold, only revealed when you dig.

Sailing between islands costs fuel equal to the Manhattan distance (horizontal + vertical steps). Digging also costs 1 fuel. Plan your route carefully — you cannot afford to zigzag across the map.

Click "Sail ⛵" on any island to move there. The fuel cost is shown on the button. Click "Dig ⛏️" to dig at your current island. After digging the result is revealed immediately — either gold or sand.

Strategy: Don't chase low-probability islands far away. Look for clusters of high-probability islands near each other and plan an efficient route. Save enough fuel to dig 4–6 islands rather than wasting it sailing too far. Islands with 70%+ probability are usually worth a detour. Gold target of 300 earns a perfect score — you will need to find 3–4 rich treasures to reach it. Good luck, captain!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: PirateState, action: PirateAction) => PirateState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".pirate-dig-btn", pulses: 3 }; },
  component: PiratesBounty,
} as unknown as GamePlugin;
