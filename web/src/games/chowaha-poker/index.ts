import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChowahaPokerState, ChowahaPokerAction, ChowahaPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChowahaPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChowahaPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chowahaPokerPlugin: GamePlugin<ChowahaPokerState, ChowahaPokerAction, typeof settings> = {
  id:"chowaha-poker", title:"Chowaha Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Chowaha; OFC-style hand with Omaha hole-card structure.",
  howToPlay:"Chowaha Solo simulates the OFC-Omaha hybrid where Chinese Open-Face rules apply to four-card Omaha holdings. Press Deal each round to receive six cards and the engine grades the best five-card poker hand among combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds total — each is a fresh Chowaha layout.\n\nLive Chowaha is a niche OFC variant: each player takes Omaha-style hole cards and arranges them into rows like Chinese Poker. The result is a strange equity calculation between top, middle, and bottom rows. Here each deal abstracts the layout into a six-card pull and best-five score. Press Next to grind eight Chowaha rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChowahaPokerSettings),
  reducer,isTerminal,  hint: (state: ChowahaPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-chowaha-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chowaha-poker-next"]', pulses: 3 };
    return null;
  },
  component:ChowahaPokerGame,
};
