import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CivilRightsQuizState, CivilRightsQuizAction, CivilRightsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CivilRightsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CivilRightsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const civilRightsQuizPlugin: GamePlugin<CivilRightsQuizState, CivilRightsQuizAction, typeof settings> = {
  id:"civil-rights-quiz", title:"Civil Rights Leaders Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Champions of justice from MLK and Mandela to Malala and beyond.",
  howToPlay:"Civil Rights Leaders Quiz tests your knowledge of activists, organizers and freedom fighters who advanced equal rights worldwide. Questions cover the American civil rights movement, anti-apartheid leaders, women's suffragists, Indian independence, modern human-rights activists and many more — including key marches, speeches, court cases, and the milestones they helped achieve.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. The arc of history bends — see how many of its bend-makers you can name before the clock runs out.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CivilRightsQuizSettings),
  reducer,isTerminal,
  hint: (state: CivilRightsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CivilRightsQuizGame,
};
