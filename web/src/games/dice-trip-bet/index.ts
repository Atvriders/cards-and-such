import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTripBetState, DiceTripBetAction, DiceTripBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTripBetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTripBetGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceTripBetPlugin: GamePlugin<DiceTripBetState, DiceTripBetAction, typeof settings> = {
  id:"dice-trip-bet", title:"Dice Trip Bet", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and bet on hitting a triplet — all three dice showing the same value!",
  howToPlay:`Dice Trip Bet is a high-risk, high-reward dice game. Before each roll, wager any amount from your coins. Then roll three dice — if all three show the same number (a triplet: 1-1-1, 2-2-2, etc.) you win your bet. Otherwise you lose it.

Triples have roughly 1-in-36 odds. When you hit one it feels amazing!

Start with 100 coins. Choose 8 or 12 rounds in Settings. Bet small to protect your stack, or go big and gamble everything on the triple. Your final coin total is your score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTripBetSettings),
  reducer,isTerminal,component:DiceTripBetGame,
  hint: (state: DiceTripBetState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-dicetrip-bet"]', pulses: 3 };
    if (state.phase === "revealed") return { selector: '[data-testid="hint-target-dicetrip-next"]', pulses: 3 };
    return null;
  },
};
