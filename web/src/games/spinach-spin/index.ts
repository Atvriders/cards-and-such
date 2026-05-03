import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpinachSpinState, SpinachSpinAction, SpinachSpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpinachSpinGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpinachSpinGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spinachSpinPlugin: GamePlugin<SpinachSpinState, SpinachSpinAction, typeof settings> = {
  id:"spinach-spin", title:"Spinach Spin", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap spinning spinach leaves in 25 seconds. A snappier, shorter veggie arcade.",
  howToPlay:`Spinach Spin is a fast 25-second clicker arcade. Spinning spinach leaves drift through five lanes; tap each one before it spins out of frame. Each tap is 10 points.\n\nThe board ticks roughly once per second, spawning leaves at random lanes. Each leaf hangs around for a few ticks before vanishing. Because the round is shorter than the standard 30-second clicker, every tap counts more.\n\nThere's no skill ceiling: tap as fast as you can. Average runs land near 150-250 points; sharpshooters past 400 are showing real reflexes.\n\nSpinach is a Popeye favorite — full of iron, magnesium, and folate. Tap it, score it, eat it!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpinachSpinSettings),
  reducer,isTerminal,
  hint: (state: SpinachSpinState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-spinach-spin-target"]', pulses: 3 };
  },
  component:SpinachSpinGame,
};
