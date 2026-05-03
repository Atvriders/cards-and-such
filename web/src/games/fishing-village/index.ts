import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FishingVillageState, FishingVillageAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FishingVillage = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FishingVillage as unknown as React.ComponentType<unknown> })));
export const fishingVillagePlugin = {
  id: "fishing-village",
  title: "Fishing Village",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Manage a fishing village over 14 days. Fish, sell, repair, and rest to maximize your end-season coins!",
  howToPlay: `Fishing Village is a daily-decision simulation spanning 14 days. Each day you choose one action that determines how you build your fortune as a seaside fisher.

Five actions are available. Shore Fishing costs 1 energy and catches common fish (cod, herring, bass) — safe even in rough weather. Deep Fishing costs 2 energy and 1 boat durability but yields valuable tuna and salmon. Storms make deep fishing dangerous and cost extra durability. Rest recovers 3 energy so you can keep working. Sell Fish takes your entire catch to market for coins. Repair Boat spends 5 coins per durability point restored.

Two resources require ongoing management. Energy (max 5) depletes with fishing and restores with rest. Boat Durability (max 10) degrades with deep fishing and storms — if it hits 0, deep fishing becomes impossible.

Weather cycles randomly between sunny, cloudy, and stormy. Sunny days boost catches. Stormy days damage your boat during deep sea trips.

Strategy: Alternate between deep fishing streaks and rest days. Sell fish regularly rather than hoarding. Keep boat durability above 3. Aim for 300 coins at season end for a perfect score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FishingVillageState, action: FishingVillageAction) => FishingVillageState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".fv-action-btn", pulses: 3 }; },
  component: FishingVillage,
} as unknown as GamePlugin;
