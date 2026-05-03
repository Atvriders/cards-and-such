import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColdWarQuizState, ColdWarQuizAction, ColdWarQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColdWarQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColdWarQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const coldWarQuizPlugin: GamePlugin<ColdWarQuizState, ColdWarQuizAction, typeof settings> = {
  id:"cold-war-quiz", title:"Cold War Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Cold War — the space race, nuclear tension, and the fall of the Soviet Union.",
  howToPlay:`Cold War Quiz tests your knowledge of the ideological conflict between the USA and Soviet Union that defined the second half of the 20th century. Questions cover the space race, nuclear brinkmanship, the Berlin Wall, Korean and Vietnam Wars, détente, key leaders like Khrushchev and Gorbachev, and the Soviet Union's collapse.

Each question has four choices. Pick the correct one to earn 10 points. Green means correct; red means wrong.

Press Next to advance. Choose 5, 10, or 15 questions in Settings.

Key facts: Churchill coined "Iron Curtain"; Sputnik was the first satellite (1957); Yuri Gagarin was first in space; the Cuban Missile Crisis was 1962; the Berlin Wall fell in 1989; the USSR dissolved in 1991; Gorbachev introduced glasnost. Learn these milestones and you will ace the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColdWarQuizSettings),
  reducer,isTerminal,
  hint: (state: ColdWarQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ColdWarQuizGame,
};
