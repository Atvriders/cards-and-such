import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SmoothieSwipeState, SmoothieSwipeAction, SmoothieSwipeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SmoothieSwipeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SmoothieSwipeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const smoothieSwipePlugin: GamePlugin<SmoothieSwipeState, SmoothieSwipeAction, typeof settings> = {
  id:"smoothie-swipe", title:"Smoothie Swipe", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap smoothie cups in a 30-second blender frenzy.",
  howToPlay:`Smoothie Swipe is a 30-second clicker arcade game. Fruity smoothie cups appear on a six-lane board; tap each smoothie as fast as you can to drink it for 10 points. Each smoothie hangs around for a few ticks before melting off — miss too many and your score suffers.\n\nThe board ticks roughly once per second, spawning fresh smoothies in random lanes. The board can fill quickly with pulpy targets, so keep your hand-eye coordination sharp.\n\nThere is no skill ceiling: the more smoothies you swipe in 30 seconds, the higher your score. Average runs land near 200-300 points; sharp tappers pushing 500+ are showing real reflex talent. Blend, swipe, score — and stay refreshed!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SmoothieSwipeSettings),
  reducer,isTerminal,
  hint: (state: SmoothieSwipeState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-smoothie-swipe-target"]', pulses: 3 };
  },
  component:SmoothieSwipeGame,
};
