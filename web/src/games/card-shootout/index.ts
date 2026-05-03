import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardShootoutState, CardShootoutAction, CardShootoutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardShootoutGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardShootoutGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardShootoutPlugin: GamePlugin<CardShootoutState, CardShootoutAction, typeof settings> = {
  id:"card-shootout", title:"Card Shootout", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"You vs CPU duel: high card wins. 8 duels.",
  howToPlay:"Card Shootout is a head-to-head card duel over 8 rounds. Each round, both you and the CPU draw a single card from a fresh 52-card deck. The higher rank wins the duel; on ties (same rank), neither side scores.\n\nCard ranks order from low to high: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A. Winning a duel earns 15 points; losing or tying scores zero.\n\nTap Draw to fire your shot. The card pair is revealed, and if you outdraw the CPU you bank 15 points. Press Next to advance.\n\nSince the deck is freshly shuffled each duel, expected wins are ~46% with ~8% ties. A typical 8-duel run lands 40-70 points. A perfect 8-for-8 shootout earns the maxed 120 points and outlaw glory.\n\nPure luck, instant feedback, and a satisfying duel structure — Card Shootout is a quick, dramatic card mini.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardShootoutSettings),
  reducer,isTerminal,
    hint: (state: CardShootoutState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-card-shootout-action"]', pulses: 3 };
    },
  component:CardShootoutGame,
};
