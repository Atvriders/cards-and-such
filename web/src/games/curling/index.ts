import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type CurlingState, type CurlingAction } from "./state.js";
const Curling = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Curling as unknown as React.ComponentType<unknown> })));
export const curlingSettings = {
  ends: { kind: "enum" as const, label: "Ends", options: ["4", "8"] as const, default: "4" as const },
} as const;

export const curlingPlugin: GamePlugin<CurlingState, CurlingAction, typeof curlingSettings> = {
  id: "curling",
  title: "Curling",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide stones down the sheet toward the button. Control weight, line, and sweeping for maximum score.",
  howToPlay: `Curling challenges you to deliver stones as close to the centre of the house (button) as possible over multiple ends.

Three controls shape each delivery. Weight sets how hard you throw — too light and the stone falls short; too heavy and it runs through the house. Draw weight (around 65%) targets the button perfectly. Delivery Line steers left or right of center; the button is at 50%, so keep your line close to center unless you're playing angles.

Sweeping adds extra distance to a delivery by reducing friction on the ice. Use moderate sweeping (50–70%) to compensate for a slightly light throw, or no sweeping to let a heavy stone die naturally.

Scoring by ring: the button scores 4 points, the 8-foot ring 3, the 12-foot ring 2, the outer ring 1, outside the house scores 0. Each stone you throw adds to your cumulative total across all ends.

You throw 4 stones per end. The game runs for 4 or 8 ends. High-level curling scores average 8+ points per end — can you hit double digits?

Tip: consistent 65% weight and 50% line with moderate sweeping builds up a reliable score. Trying for the button every shot is high risk, high reward.`,
  settings: curlingSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-curling-action"]', pulses: 3 }; },
  component: Curling,
};
