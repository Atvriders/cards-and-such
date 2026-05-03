import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMirrorState, DiceMirrorAction, DiceMirrorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceMirrorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceMirrorGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMirrorPlugin: GamePlugin<DiceMirrorState, DiceMirrorAction, typeof settings> = {
  id:"dice-mirror", title:"Dice Mirror", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll two dice — earn points when they mirror (match). 12 rounds.",
  howToPlay:"Dice Mirror is a luck-driven doubles minigame. Each round you roll two six-sided dice; if they show the same face — a \"mirror\" — you score points equal to that face value times 10 (so double-1 is 10, double-6 is 60). Mismatched dice score zero.\n\nThe probability of any double on a single roll is 1 in 6 (about 16.7%). Across 12 rounds, an average game lands 1-3 mirrors; lucky streaks of 4 or more are real bragging rights, and a perfect 12-mirror game is astronomically rare.\n\nPress Roll to fire both dice and see the result. The mirror check and points are awarded immediately. Press Next to move on to the next round.\n\nThere's no skill — it's pure variance — but the bigger your lucky doubles, the bigger your score. Aim for the snake-eyes... or better yet, the boxcars!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMirrorSettings),
  reducer,
  isTerminal,
  hint: (state: DiceMirrorState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-mirror-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-mirror-next"]', pulses: 3 };
    return null;
  },
  component:DiceMirrorGame,
};
