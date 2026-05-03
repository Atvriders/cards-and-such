import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceLaboratoryState, DiceLaboratoryAction, DiceLaboratorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceLaboratoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceLaboratoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceLaboratoryPlugin: GamePlugin<DiceLaboratoryState, DiceLaboratoryAction, typeof settings> = {
  id:"dice-laboratory", title:"Dice Laboratory", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lab experiments with dice — odd-pip discoveries score across 10 rounds.",
  howToPlay:"Dice Laboratory is a 10-round science mini where odd-pip rolls represent successful experiments. Each round you roll five dice; each die showing an odd value (1, 3, 5) is a documented discovery.\n\nYour round score equals 7 points for each odd die plus a 15-point experiment bonus if all 5 dice are odd. Half of all rolls per die are odd, so you'll average 2.5 odd dice per round (~17.5 points). Hitting all 5 odd is rare (1/32 = 3.125%) but earns 35 + 15 = 50 points — the laboratory jackpot.\n\nPress Roll 5 Dice to run each experiment, then Next to publish and start the next study. After 10 rounds your research portfolio is complete. Average runs land near 150-190 points. Lucky odd-streak runs push past 250. Document your discoveries — this is the Dice Laboratory!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceLaboratorySettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-laboratory-roll"]', pulses: 3 }; },
  component:DiceLaboratoryGame,
};
