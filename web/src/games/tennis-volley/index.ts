import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TennisVolleyState, TennisVolleyAction, TennisVolleySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TennisVolleyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TennisVolleyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tennisVolleyPlugin: GamePlugin<TennisVolleyState, TennisVolleyAction, typeof settings> = {
  id: "tennis-volley", title: "Tennis Volley", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Return tennis volleys with the exact right power to win the point!",
  howToPlay: `Tennis Volley puts you at the net. Each round a ball comes to you and you must select the perfect return power — enough to clear the net but not so much that it sails long.\n\nAdjust the Power slider and press Go! The closer your power to the ideal for each volley, the more points you score — up to 100 per volley.\n\n10 volleys per game. The ideal power shifts each round. Read your misses and adapt. Consistent, precise returns build the highest total score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TennisVolleySettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-tennis-volley-action"]', pulses: 3 }; },
  component: TennisVolleyGame,
};
