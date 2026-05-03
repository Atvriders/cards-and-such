import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CivilWarQuizState, CivilWarQuizAction, CivilWarQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CivilWarQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CivilWarQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const civilWarQuizPlugin: GamePlugin<CivilWarQuizState, CivilWarQuizAction, typeof settings> = {
  id:"civil-war-quiz", title:"Civil War Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the American Civil War battles, leaders, and turning points.",
  howToPlay:`Civil War Quiz tests your knowledge of the American Civil War, fought from 1861 to 1865. Questions cover key battles like Gettysburg and Antietam, Union and Confederate leaders like Grant, Lee, and Sherman, landmark documents like the Emancipation Proclamation and 13th Amendment, and the war's causes and conclusion.

Each question presents four choices. The correct answer turns green; a wrong pick turns red. Press Next to continue.

Each correct answer earns 10 points. Choose 5, 10, or 15 questions in Settings.

Key facts: Jefferson Davis led the Confederacy; Richmond was the Confederate capital; Lee surrendered at Appomattox in 1865; Antietam was the bloodiest single day; Gettysburg was the war's turning point; the 13th Amendment abolished slavery; Lincoln was assassinated by John Wilkes Booth. Know these and you will ace the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CivilWarQuizSettings),
  reducer,isTerminal,
  hint: (state: CivilWarQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CivilWarQuizGame,
};
