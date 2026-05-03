import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BonnieClydeQuizState, BonnieClydeQuizAction, BonnieClydeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BonnieClydeQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BonnieClydeQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bonnieClydeQuizPlugin: GamePlugin<BonnieClydeQuizState, BonnieClydeQuizAction, typeof settings> = {
  id:"bonnie-clyde-quiz", title:"Bonnie & Clyde Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Bonnie Parker and Clyde Barrow.",
  howToPlay:"Bonnie & Clyde Quiz tests your knowledge of America's most romanticized outlaws. Bonnie Parker and Clyde Barrow rampaged across the Central United States during the Great Depression with the Barrow Gang, robbing banks, gas stations and small stores from 1932 until their deaths in a Louisiana ambush in May 1934.\n\nQuestions cover their Texas backgrounds, Clyde's juvenile arrests and prison time at Eastham, the gang including Buck Barrow, Blanche, W.D. Jones and Henry Methvin, the famous photographs published in newspapers, the lawmen who hunted them — including Frank Hamer — and the bullet-riddled 1934 V-8 Ford ambush.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn zero. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BonnieClydeQuizSettings),
  reducer,isTerminal,
  hint: (state: BonnieClydeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BonnieClydeQuizGame,
};
