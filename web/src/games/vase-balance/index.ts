import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VaseBalanceState, VaseBalanceAction, VaseBalanceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VaseBalanceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.VaseBalanceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const vaseBalancePlugin: GamePlugin<VaseBalanceState, VaseBalanceAction, typeof settings> = {
  id: "vase-balance", title: "Vase Balance", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Place the right amount of weight to balance the vase perfectly on the narrow shelf!",
  howToPlay: `Vase Balance is a delicate precision challenge. Each round, a decorative vase sits on a narrow shelf. You control how much ballast weight to add to keep it balanced. Too little and it tips; too much and it cracks.\n\nAdjust the Weight slider to match the hidden balance point for each vase. The ideal balance changes every round as the vase shape and shelf angle vary.\n\nScore depends on accuracy. 10 rounds per game. A steady hand and careful observation of each round's feedback will guide you to a perfect balance — and a perfect score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as VaseBalanceSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-vase-balance-action"]', pulses: 3 }; },
  component: VaseBalanceGame,
};
