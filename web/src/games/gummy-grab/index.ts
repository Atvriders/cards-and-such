import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GummyGrabState, GummyGrabAction, GummyGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GummyGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GummyGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gummyGrabPlugin: GamePlugin<GummyGrabState, GummyGrabAction, typeof settings> = {
  id: "gummy-grab", title: "Gummy Grab", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Grab gummy bears from a jar — set the right power to get the maximum handful!",
  howToPlay: `Gummy Grab has you reaching into a jar of gummy bears. Each round set the power slider — too light and you get few gummies, too strong and you knock the jar. The closer to the sweet spot, the more gummies (points) you grab. 10 rounds of sticky-fingered fun!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as GummyGrabSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-gummy-grab-action"]', pulses: 3 }; },
  component: GummyGrabGame,
};
