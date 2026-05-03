import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StudMahaState, StudMahaAction, StudMahaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StudMahaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StudMahaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const studMahaPlugin: GamePlugin<StudMahaState, StudMahaAction, typeof settings> = {
  id:"stud-maha", title:"Stud-maha (Omaha Stud) Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Omaha-Stud hybrid; four hole cards + three stud streets.",
  howToPlay:"Stud-maha Solo simulates the Omaha-Stud hybrid: four hole cards plus three face-up stud streets. Press Deal each round to receive seven cards and the engine grades the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — each a Stud-maha layout.\n\nLive Stud-maha forces players to use exactly two from their four hole cards plus three from their stud streets. The constraint creates unique combo math — hands play very differently from straight Omaha or stud. Here the seven-card draw is graded by best-five, abstracting the hole/stud split. Press Next to grind eight hybrid rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StudMahaSettings),
  reducer, isTerminal,   hint: (state: StudMahaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-stud-maha-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-stud-maha-next"]', pulses: 3 };
    return null;
  },
  component:StudMahaGame,
};
