import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PairPursuitState, PairPursuitAction, PairPursuitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PairPursuitGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PairPursuitGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pairPursuitPlugin: GamePlugin<PairPursuitState, PairPursuitAction, typeof settings> = {
  id:"pair-pursuit", title:"Pair Pursuit", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 4 dice each round. Pairs +20, triples +50, quadruples +100.",
  howToPlay:`Pair Pursuit is a quick four-dice chase for matched groups. Each round, you roll four dice. The reducer scores your best matched group automatically: a single pair earns 20 points, three of a kind earns 50, and four of a kind earns a generous 100. No match (all four dice different) earns nothing.

You play 10 rounds. The expected average score lands around 250 to 280 points across a game (since pairs occur in about half of all rolls of four dice). Hit 350 or more and you've had a streak of luck.

After each round, press Next to continue. There's no choice — just press Roll, see the dice come up, watch the best-match scorer crunch the numbers, and move on. Aim for those rare quadruples (about a 1-in-216 chance per roll) and watch your score balloon!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PairPursuitSettings),
  reducer,isTerminal,
  hint: (state: PairPursuitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-pair-pursuit-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-pair-pursuit-next"]', pulses: 3 };
    return null;
  },
  component:PairPursuitGame,
};
