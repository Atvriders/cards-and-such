import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EclairGrabState, EclairGrabAction, EclairGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EclairGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EclairGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eclairGrabPlugin: GamePlugin<EclairGrabState, EclairGrabAction, typeof settings> = {
  id: "eclair-grab", title: "Eclair Grab", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Grab eclairs from a moving tray — time your power perfectly to snag the best ones!",
  howToPlay: `Eclair Grab puts delicious chocolate eclairs on a moving display. Each round, set your grab power and press Go! to reach for an eclair. The closer your power to the target, the more completely you grab the eclair and the higher your score. 10 rounds of pastry precision!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as EclairGrabSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-eclair-grab-action"]', pulses: 3 }; },
  component: EclairGrabGame,
};
