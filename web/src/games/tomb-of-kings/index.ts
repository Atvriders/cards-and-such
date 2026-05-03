import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TombOfKingsState, TombOfKingsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TombOfKings = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TombOfKings as unknown as React.ComponentType<unknown> })));
export const tombOfKingsPlugin = {
  id: "tomb-of-kings",
  title: "Tomb of Kings",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a 7x7 procedurally generated tomb — collect gold and reach the exit alive.",
  howToPlay: `Tomb of Kings is a dungeon exploration game. You navigate a 7x7 grid tomb from the top-left start (S) to the bottom-right exit (E), collecting gold and surviving traps and monsters.

Use the directional buttons to move one step at a time. Adjacent cells are revealed as you explore, but the rest of the tomb is hidden (shown as ?). You cannot walk through walls (#).

Cell types: Gold (G) gives you treasure ranging from 5-20 coins. Traps (!) deal 5-15 damage — watch your health bar! Monsters (M) deal 8-20 damage but drop 5 bonus gold. Shrines (+) restore 15 HP — seek them out if you're wounded.

Your score is based on two things: gold collected (up to 60 points) and HP remaining when you reach the exit (up to 40 points). If you die before escaping, you only score based on any gold you already banked — max 30 points.

Strategy: Reveal as much of the map as possible before committing your path. Look for shrines to recover HP. You don't have to collect every treasure — if your HP is low, head straight for the exit. Each game is procedurally generated so the map changes every run.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TombOfKingsState, action: TombOfKingsAction) => TombOfKingsState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".tok-btn", pulses: 3 }; },
  component: TombOfKings,
} as unknown as GamePlugin;
