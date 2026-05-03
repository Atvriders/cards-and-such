import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BulletTrainsQuizState, BulletTrainsQuizAction, BulletTrainsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BulletTrainsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BulletTrainsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bulletTrainsQuizPlugin: GamePlugin<BulletTrainsQuizState, BulletTrainsQuizAction, typeof settings> = {
  id:"bullet-trains-quiz", title:"Bullet Trains Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Shinkansen, TGV, ICE — test your high-speed rail knowledge.",
  howToPlay:"Bullet Trains Quiz tests your knowledge of high-speed rail. Japan's Shinkansen pioneered the era in 1964; today the TGV, ICE, AVE, KTX, China's CRH, and Italy's Frecciarossa whisk passengers between cities at 300 km/h and beyond. This quiz covers operators, speeds, routes, and the engineering that makes them run.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Hop aboard and see how fast you can answer!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BulletTrainsQuizSettings),
  reducer,isTerminal,
  hint: (state: BulletTrainsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BulletTrainsQuizGame,
};
