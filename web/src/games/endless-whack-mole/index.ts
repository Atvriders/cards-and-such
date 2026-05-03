import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EndlessWhackMoleState, EndlessWhackMoleAction, EndlessWhackMoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EndlessWhackMoleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EndlessWhackMoleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const endlessWhackMolePlugin: GamePlugin<EndlessWhackMoleState, EndlessWhackMoleAction, typeof settings> = {
  id:"endless-whack-mole", title:"Endless Whack-a-Mole", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Endless tap-the-moles clicker with rising pace.",
  howToPlay:"Endless Whack-a-Mole is a thirty-second clicker where moles pop up across six lanes — tap each mole before it ducks back underground to score ten points. Missed moles age out and count against your accuracy. The mole field ticks about once per second, spawning one or two fresh moles per tick. Each mole only stays above ground for a few ticks before disappearing. The timer counts down from thirty seconds in the upper-right corner. Average runs net 220-300 points; whack-pros with quick reflexes routinely score 380+. Empty-space taps are free of penalty, so attack the field aggressively when multiple moles appear at once. With its warm earthy aesthetic and pure reflex gameplay, Endless Whack-a-Mole is the comfort-food of arcade clickers. When the timer hits zero, the field goes still and your final score is locked in. Whack 'em fast, whack 'em hard!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EndlessWhackMoleSettings),
  reducer,isTerminal,hint: (state: EndlessWhackMoleState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-endless-whack-mole-primary"]', pulses: 3 } : null,component:EndlessWhackMoleGame,
};
