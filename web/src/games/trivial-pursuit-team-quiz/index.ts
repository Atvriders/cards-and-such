import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitTeamQuizState, TrivialPursuitTeamQuizAction, TrivialPursuitTeamQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrivialPursuitTeamQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrivialPursuitTeamQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitTeamQuizPlugin: GamePlugin<TrivialPursuitTeamQuizState, TrivialPursuitTeamQuizAction, typeof settings> = {
  id:"trivial-pursuit-team-quiz", title:"Trivial Pursuit Team Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Meta-trivia about the cooperative team variant of Trivial Pursuit.",
  howToPlay:"Trivial Pursuit Team Trivia covers the cooperative two-team variant of the classic trivia franchise — its scoring rules, tiebreakers, encouraged team behavior, and the way it differs from the solo classic Genus rules. Each round delivers ten questions about the Team edition itself, drawing on its publisher history, team dynamics, and gameplay structure. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 points for every second remaining on the 15-second timer, so the faster you answer the more you score. A wrong choice reveals the correct answer and disables further selection; press Next to advance. After ten questions, your final score is shown. Whether you've played Trivial Pursuit Team at office parties or you just like learning party-game design history, this quiz will reveal how thoroughly you know the cooperative TP experience.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitTeamQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitTeamQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitTeamQuizGame,
};
