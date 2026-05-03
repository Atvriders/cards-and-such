import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LatteLeapState, LatteLeapAction, LatteLeapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LatteLeapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LatteLeapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const latteLeapPlugin: GamePlugin<LatteLeapState, LatteLeapAction, typeof settings> = {
  id:"latte-leap", title:"Latte Leap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click leaping latte cups. 30s clicker.",
  howToPlay:"Latte Leap is a 30-second latte-cup clicker. Lattes leap across six lanes; tap each one to catch it for 10 points. Lattes only stay airborne for a few ticks before they hop offscreen — so keep your finger ready!\n\nEach tick (about once a second) spawns one or two new lattes in random lanes. There is no strategy beyond aim and speed; this is a pure clicker. Average runs land at 200–300 points; strong players push 400+ and the very best can break 500.\n\nThe countdown timer reads down from 30 in the top right corner of the play area. When the clock hits zero, your final tally locks in. Wake up your reflexes and tap those lattes before they leap to freedom!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LatteLeapSettings),
  reducer,isTerminal,
  hint: (state: LatteLeapState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-latte-leap-target"]', pulses: 3 };
  },
  component:LatteLeapGame,
};
