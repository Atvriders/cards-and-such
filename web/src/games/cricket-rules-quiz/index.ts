import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CricketRulesQuizState, CricketRulesQuizAction, CricketRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CricketRulesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CricketRulesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cricketRulesQuizPlugin: GamePlugin<CricketRulesQuizState, CricketRulesQuizAction, typeof settings> = {
  id:"cricket-rules-quiz", title:"Cricket Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of cricket: overs, wickets, formats, and the LBW rule.",
  howToPlay:`Cricket Rules Quiz tests your knowledge of one of the world's most popular sports. Questions span formats (Tests, ODIs, T20s, The Hundred), the basics (innings, overs, wickets, runs), and the technical (LBW, no balls, wides, the Duckworth-Lewis-Stern method, free hits, and powerplays).

You have 15 seconds per question. Correct answers earn 100 points plus 10 bonus points per second left on the clock; wrong answers earn nothing.

Topics include pitch dimensions (22 yards), boundary lengths, fielding restrictions, types of dismissals (bowled, caught, LBW, run out, stumped, hit wicket), and umpiring decisions (DRS, third umpire). International rules differ slightly between Tests, ODIs, and T20s — be ready for them all.

Tap, Submit, Next. Choose 10, 20, or 30 questions in Settings. Whether you follow the IPL, World Cup, or village green, sharpen your cricket IQ!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CricketRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: CricketRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CricketRulesQuizGame,
};
