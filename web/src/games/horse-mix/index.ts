import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorseMixState, HorseMixAction, HorseMixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HorseMixGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HorseMixGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const horseMixPlugin: GamePlugin<HorseMixState, HorseMixAction, typeof settings> = {
  id:"horse-mix", title:"HORSE Mix Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo HORSE rotation: each round deals six cards (mixed variants), best five-card high scored.",
  howToPlay:"HORSE Mix Solo simulates the legendary mixed game rotation: Hold'em, Omaha Hi-Lo, Razz, 7-Card Stud, 8-or-Better. In live play the variant rotates each orbit. Here, press Deal each round to receive six random cards from a 52-card deck — a compromise width across the five formats.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nTen rounds. The variant rotation in live HORSE keeps pros honest — you must master five games. Here the rotation is abstracted into one consistent six-card deal each round, but the eclectic range of sub-game scoring expectations is mirrored by the medium-width pool.\n\nPress Next between rounds and try multiple seeds for a true HORSE marathon experience.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HorseMixSettings),
  reducer, isTerminal,   hint: (state: HorseMixState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-horse-mix-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-horse-mix-next"]', pulses: 3 };
    return null;
  },
  component:HorseMixGame,
};
