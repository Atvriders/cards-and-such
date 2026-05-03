import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YatzyScandState, YatzyScandAction, YatzyScandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YatzyScandGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YatzyScandGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const yatzyScandPlugin: GamePlugin<YatzyScandState, YatzyScandAction, typeof settings> = {
  id:"yatzy-scand", title:"Yatzy (Scandinavian)", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Yatzy, the Scandinavian relative of Yahtzee.",
  howToPlay:"Yatzy Trivia is a ten-question quiz about Yatzy, the Scandinavian variation of Yahtzee played with five dice and a 15-category score sheet. Like Yahtzee, players roll five dice up to three times per turn and assign the result to a category. Yatzy's distinctive features include the 'One Pair' through 'Two Pairs' categories, a slightly different bonus threshold (often 50 points for upper section), and 'Yatzy' (five-of-a-kind) scoring 50 points. The game is enormously popular across Sweden, Norway, Denmark, and Finland. Each question tests rules, scoring categories, bonus thresholds, and history of Yatzy. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Yatzy keeps the dice-rolling joy of Yahtzee while adding Nordic twists.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YatzyScandSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-yatzy-scand-primary"]', pulses: 3 }), component:YatzyScandGame,
};
