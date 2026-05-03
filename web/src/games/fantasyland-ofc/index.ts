import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FantasylandOfcState, FantasylandOfcAction, FantasylandOfcSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FantasylandOfcGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FantasylandOfcGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fantasylandOfcPlugin: GamePlugin<FantasylandOfcState, FantasylandOfcAction, typeof settings> = {
  id:"fantasyland-ofc", title:"Fantasyland OFC Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Fantasyland: 13 cards dealt at once, best five-card high scored.",
  howToPlay:"Fantasyland OFC Solo simulates the bonus round in Open-Face Chinese where qualifying top-row earns the player all 13 cards at once. Press Deal each round to receive all 13 cards from a 52-card deck; the best five-card poker hand among them is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live OFC, Fantasyland is the Holy Grail — a turn where you see all your cards before placing. The strategic optimisation potential is massive. Here the seeded RNG gives you that big-card vista each round and scores the strongest sub-hand.\n\nFour rounds. With 13 cards, Quads and Full Houses are abundant. Press Next between rounds and try multiple seeds for the perfect Fantasyland session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FantasylandOfcSettings),
  reducer,isTerminal,  hint: (state: FantasylandOfcState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-fantasyland-ofc-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-fantasyland-ofc-next"]', pulses: 3 };
    return null;
  },
  component:FantasylandOfcGame,
};
