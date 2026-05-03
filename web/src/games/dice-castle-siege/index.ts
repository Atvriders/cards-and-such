import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCastleSiegeState, DiceCastleSiegeAction, DiceCastleSiegeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCastleSiegeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCastleSiegeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCastleSiegePlugin: GamePlugin<DiceCastleSiegeState, DiceCastleSiegeAction, typeof settings> = {
  id:"dice-castle-siege", title:"Dice Castle Siege", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Siege the castle by rolling dice. Doubles breach the walls.",
  howToPlay:"Dice Castle Siege is a 10-round dice-rolling game with a doubles bonus. 🏰 Each round, press Roll Dice and two dice tumble across the screen. If both faces match (doubles), you score the doubled face times 10. Otherwise, you score the simple sum of the two dice.\n\nSums of non-doubles range 3-11; doubles range 10-60 with double-six the maximum. Doubles occur 1 in 6 rounds on average, so a typical 10-round game lands around 75-95 points, but a lucky double-six round alone bags 60.\n\nPress Next after each result to continue, or Finish on the final round. Watch your running score climb in the upper right. Great for quick mini-game breaks: the whole game is over in well under a minute. Roll for those doubles!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCastleSiegeSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCastleSiegeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "choose") return { selector: '[data-testid="hint-target-dice-castle-siege-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-castle-siege-next"]', pulses: 3 };
    return null;
  },
  component:DiceCastleSiegeGame,
};
