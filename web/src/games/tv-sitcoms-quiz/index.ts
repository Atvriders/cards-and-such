import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TvSitcomsQuizState, TvSitcomsQuizAction, TvSitcomsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TvSitcomsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TvSitcomsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tvSitcomsQuizPlugin: GamePlugin<TvSitcomsQuizState, TvSitcomsQuizAction, typeof settings> = {
  id:"tv-sitcoms-quiz", title:"TV Sitcoms Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of TV sitcoms — Friends, Seinfeld, The Office, and more.",
  howToPlay:`TV Sitcoms Quiz tests your knowledge of the funniest shows on television. From classic Boston bar 'Cheers' and the show-about-nothing 'Seinfeld' to 'Friends', 'The Office', 'Parks and Recreation', 'Modern Family', and 'How I Met Your Mother', you'll be quizzed on characters, catchphrases, settings, and the actors who made us laugh week after week.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Could it BE any more fun?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TvSitcomsQuizSettings),
  reducer,isTerminal,
  hint: (state: TvSitcomsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TvSitcomsQuizGame,
};
