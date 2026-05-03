import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorBallDropState, ColorBallDropAction, ColorBallDropSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorBallDropGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorBallDropGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const colorBallDropPlugin: GamePlugin<ColorBallDropState, ColorBallDropAction, typeof settings> = {
  id:"color-ball-drop", title:"Color Ball Drop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap green balls dropping through the rings.",
  howToPlay:"Color Ball Drop is a thirty-second reflex sprint where colored balls drop through six target rings — tap each ball before it exits the rings to score ten points. Missed balls age out and count against your accuracy. The drop tunnel ticks about once per second, spawning one or two fresh balls each tick. Each ball only stays in the rings for a few ticks before slipping past. The timer counts down from thirty seconds in the upper-right corner. With its bold green-on-green aesthetic, Color Ball Drop is pure reflex gameplay — quick eyes and quick fingers win the day. Average runs net 220-300 points; ball-tracking reflex masters score 380+ regularly. Empty-space taps are free of penalty, so attack the screen aggressively when multiple balls appear at once. When the timer hits zero, the tunnel goes still and your final score is locked in. Drop, tap, color the world!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColorBallDropSettings),
  reducer,isTerminal,hint: (state: ColorBallDropState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-color-ball-drop-primary"]', pulses: 3 } : null,component:ColorBallDropGame,
};
