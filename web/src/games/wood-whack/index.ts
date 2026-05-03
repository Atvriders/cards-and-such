import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WoodWhackState, WoodWhackAction, WoodWhackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WoodWhackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WoodWhackGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const woodWhackPlugin: GamePlugin<WoodWhackState, WoodWhackAction, typeof settings> = {
  id:"wood-whack", title:"Wood Whack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click drifting wood pieces. 30-second clicker.",
  howToPlay:"Wood Whack is a 30-second lumber-themed arcade clicker. Pieces of wood drift across the screen in six lanes; tap each plank as fast as you can to chop it down for 10 points. Miss them and they float off the board unscored.\n\nThe board ticks roughly once per second, spawning fresh wood pieces in random lanes. As you build up speed, the screen fills with drifting timber — every tap is a point.\n\nThere's no skill ceiling: the more wood you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent.\n\nThe clock counts down in the top right; when it hits zero, your final score is locked in. Grab your axe and start chopping — those logs aren't going to whack themselves!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WoodWhackSettings),
  reducer,isTerminal,
  hint: (state: WoodWhackState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-wood-whack-target"]', pulses: 3 };
  },
  component:WoodWhackGame,
};
