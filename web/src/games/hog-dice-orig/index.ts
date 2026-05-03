import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogDiceOrigState, HogDiceOrigAction, HogDiceOrigSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HogDiceOrigGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HogDiceOrigGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hogDiceOrigPlugin: GamePlugin<HogDiceOrigState, HogDiceOrigAction, typeof settings> = {
  id:"hog-dice-orig", title:"Hog (Dice)", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Hog, a single-roll-commitment dice push-your-luck game.",
  howToPlay:"Hog Trivia is a ten-question quiz about Hog, a single-decision push-your-luck dice game. Each turn the player commits in advance to a number of dice they will roll — anywhere from 1 to typically 100 — then rolls them all at once. If no 1 appears, they score the sum of all the dice. If any die shows a 1, they score zero for that turn. Players take turns and the first to reach a target score (usually 100) wins. The math behind Hog is famously interesting: there's an optimal commit-count for each game state. Each question tests rules, math, strategy, and history of Hog. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HogDiceOrigSettings),
  reducer,isTerminal,
  hint: (state: HogDiceOrigState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-hog-dice-orig-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-hog-dice-orig-submit"]', pulses: 3 };
  },
  component:HogDiceOrigGame,
};
