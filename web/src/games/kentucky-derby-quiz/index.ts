import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KentuckyDerbyQuizState, KentuckyDerbyQuizAction, KentuckyDerbyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KentuckyDerbyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KentuckyDerbyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kentuckyDerbyQuizPlugin: GamePlugin<KentuckyDerbyQuizState, KentuckyDerbyQuizAction, typeof settings> = {
  id:"kentucky-derby-quiz", title:"Kentucky Derby Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Kentucky Derby history.",
  howToPlay:"Kentucky Derby Quiz tests your knowledge of the Run for the Roses. Questions cover Triple Crown winners, legendary horses and jockeys, Churchill Downs traditions, mint juleps, big hats, and the iconic 'most exciting two minutes in sports.'\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Secretariat's record to American Pharoah's Triple Crown to long-shot Mine That Bird, Kentucky Derby Quiz is for racing fans who love thoroughbred history.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KentuckyDerbyQuizSettings),
  reducer,isTerminal,
  hint: (state: KentuckyDerbyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KentuckyDerbyQuizGame,
};
