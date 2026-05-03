import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CandyCaneGrabState, CandyCaneGrabAction, CandyCaneGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CandyCaneGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CandyCaneGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const candyCaneGrabPlugin: GamePlugin<CandyCaneGrabState, CandyCaneGrabAction, typeof settings> = {
  id: "candy-cane-grab", title: "Candy Cane Grab", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Hook candy canes at just the right angle to score big in this sweet arcade game!",
  howToPlay: `Candy Cane Grab has you hooking candy canes with a power-based swing. Set the angle slider and press Go! to make your grab. The closer you are to the target angle, the more candy canes you collect and the more points you earn. 10 rounds of sugary fun!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CandyCaneGrabSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-candy-cane-grab-action"]', pulses: 3 }; },
  component: CandyCaneGrabGame,
};
