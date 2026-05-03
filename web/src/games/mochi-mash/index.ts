import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MochiMashState, MochiMashAction, MochiMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MochiMashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MochiMashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mochiMashPlugin: GamePlugin<MochiMashState, MochiMashAction, typeof settings> = {
  id:"mochi-mash", title:"Mochi Mash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mash chewy mochi balls as they appear on the wagashi tray. 25-second clicker arcade.",
  howToPlay:"Mochi Mash is a 25-second clicker themed on Japan's beloved chewy rice cake. Round mochi balls appear across the wagashi tray; mash each one before it bounces away. Every mochi you mash scores 10 points.\n\nThe game ticks roughly once per second, spawning fresh mochi in random lanes. The board can fill with squishy targets quickly, so practice your tap speed and aim sharp — every mochi you mash is 10 points closer to a top score.\n\nWith only 25 seconds on the clock — five seconds shorter than the standard cuisine clickers — Mochi Mash demands extra speed. There's no skill ceiling: the more mochi you click, the higher your score. Average runs land near 180-260 points; sharpshooters pushing 400+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nChewy, sweet, sticky — mash them all before time runs out!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MochiMashSettings),
  reducer,isTerminal,
  hint: (state: MochiMashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-mochi-mash-target"]', pulses: 3 };
  },
  component:MochiMashGame,
};
