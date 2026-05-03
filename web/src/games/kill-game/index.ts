import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KillGameState, KillGameAction, KillGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KillGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KillGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const killGamePlugin: GamePlugin<KillGameState, KillGameAction, typeof settings> = {
  id:"kill-game", title:"Kill Game Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo kill-game poker; doubled stakes simulated after wins.",
  howToPlay:"Kill Game Solo simulates the limit-poker tradition where pot size doubles for the next hand after specific win conditions are met. Press Deal each round to receive seven cards and the engine picks the best five-card poker hand from the 21 possible combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — every other one is a 'kill round' with doubled stakes.\n\nLive kill games typically activate after winning two consecutive hands or scooping a hi-lo split. The doubled stakes shift strategy: tighter ranges on the kill, wider ranges right after. Here every odd round counts double if you outscore the prior round. Press Next to chase a doubled-stakes high!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KillGameSettings),
  reducer, isTerminal,   hint: (state: KillGameState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-kill-game-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-kill-game-next"]', pulses: 3 };
    return null;
  },
  component:KillGameGame,
};
