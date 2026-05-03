import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OsmosisState, OsmosisAction, OsmosisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Osmosis = /* @__PURE__ */ lazy(() => import("./Osmosis.js").then((mod) => ({ default: mod.Osmosis as unknown as React.ComponentType<unknown> })));
export const osmosisSettings = {} as const;

export const osmosisPlugin: GamePlugin<OsmosisState, OsmosisAction, typeof osmosisSettings> = {
  id: "osmosis",
  title: "Osmosis",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four foundations by suit — cards seep across like osmosis.",
  howToPlay: `Osmosis is a patience game where cards flow onto foundations by suit, spreading rank-by-rank across the tableau.

Setup: Four reserve columns of four cards (only top card visible) sit on the left. One card seeds the first foundation, establishing an anchor rank. The rest of the deck forms the stock at top.

Foundations: Each foundation holds one suit. The first foundation accepts any card of its suit in any order. The other three foundations may only accept a card of a matching rank if that same rank already appears on the first foundation — this is the osmosis rule.

Play: Draw one card at a time from the stock onto the waste. Play the waste top or any reserve top onto a valid foundation. When the stock is empty, recycle the waste (up to 3 times).

Goal: Move all 52 cards onto the four foundations.

Tips: Focus first on expanding the first foundation — every rank you add unlocks that rank on the other three suits. Keep an eye on which reserve cards are available. Efficient stock cycling is essential because recycling is limited.`,
  settings: osmosisSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-osmosis-action"]', pulses: 3 }; },
  component: Osmosis,
};
