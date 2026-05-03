import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UfoZapState, UfoZapAction, UfoZapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UfoZapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UfoZapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ufoZapPlugin: GamePlugin<UfoZapState, UfoZapAction, typeof settings> = {
  id:"ufo-zap", title:"UFO Zap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Zap UFOs cruising across the cosmos. 30-second arcade.",
  howToPlay:"UFO Zap is a 30-second arcade clicker in the style of classic whack-and-tap reflex games. Targets — drawn here as 🛸 — appear in six lanes across the playfield, each lingering for only a few ticks before drifting away. Tap or click each target as fast as you can to pop it for 10 points apiece, and make every second of the half-minute timer count.\n\nThe game spawns one or two fresh targets per tick, so the board fills quickly and your eyes will need to dart between lanes. Targets you let expire are counted as misses; the more you connect, the higher your final tally. Average runs land somewhere between 200 and 300 points, while sharper reflex players can push past 500 with focused practice.\n\nThere's no skill ceiling and no failure state besides time itself — when the timer hits zero your score is locked in. Limber up your tapping finger and chase a personal best!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UfoZapSettings),
  reducer,isTerminal,
  hint: (state: UfoZapState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-ufo-zap-target"]', pulses: 3 };
  },
  component:UfoZapGame,
};
