import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice10000State, Dice10000Action, Dice10000Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Dice10000Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Dice10000Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice10000Plugin: GamePlugin<Dice10000State, Dice10000Action, typeof settings> = {
  id:"dice-10000", title:"Dice 10000", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Target-score Farkle race. Auto-roll 6 dice, score scoring sets. 10 rounds.",
  howToPlay:"Dice 10000 (also known as 10K, Ten Thousand, or Greed in some regions) is a Farkle-family target-score push-your-luck game. The classic format races to 10,000 points. This compact version plays 10 rounds aiming to score as many points as possible.\n\nEach round you auto-roll six dice once. The system identifies all scoring sets: each 1 = 100 pts, each 5 = 50 pts, three-of-a-kind: 1s=1000, others=face×100, four-of-a-kind doubles, five-of-a-kind triples, six-of-a-kind = 5000, straight (1-6) = 1500, three pairs = 1500. If the roll has zero scoring dice, it's a Farkle (round = 0).\n\n10 rounds total. Average expected score: 1500-3500 points. Big multi-of-a-kind rolls or straights are session-defining — a six-of-a-kind alone is half a \"10K\" in one roll!\n\nClassic dice fun in compact form. Roll for the hot streak.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice10000Settings),
  reducer,
  isTerminal,
  hint: (state: Dice10000State): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-10000-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-10000-next"]', pulses: 3 };
    return null;
  },
  component:Dice10000Game,
};
