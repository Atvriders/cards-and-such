import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LuckySixState, LuckySixAction, LuckySixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LuckySixGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LuckySixGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const luckySixPlugin: GamePlugin<LuckySixState, LuckySixAction, typeof settings> = {
  id:"lucky-six", title:"Lucky Six", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll one die 12 times. +20 per six.",
  howToPlay:`Lucky Six is a single-die luck quest. You'll roll a six-sided die 12 times across the game. Every roll that comes up 6 scores 20 points; every other result scores nothing. Simple as that.

The probability of any roll being a 6 is 1/6 (about 16.7%). Across 12 rolls you can expect to land 2 sixes on average, or roughly 40 points. Three sixes is a very good run; four is excellent; five or more is the dice gods smiling broadly upon you.

There's no decision-making — just press Roll and Next. The result panel shows what came up and your running score and six-count. The whole game takes about 30 seconds and is perfect for a quick adrenaline spike. Roll often, roll loud, and chase that lucky number 6!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LuckySixSettings),
  reducer,isTerminal,
  hint: (state: LuckySixState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-lucky-six-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-lucky-six-next"]', pulses: 3 };
    return null;
  },
  component:LuckySixGame,
};
