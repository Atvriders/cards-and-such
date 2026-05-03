import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TvShowQuizState, TvShowQuizAction, TvShowQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TvShowQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TvShowQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tvShowQuizPlugin: GamePlugin<TvShowQuizState, TvShowQuizAction, typeof settings> = {
  id: "tv-show-quiz", title: "TV Show Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your TV knowledge — from Breaking Bad to Game of Thrones, can you name the show?",
  howToPlay: `TV Show Quiz puts your television knowledge to the test across decades of iconic series. Questions cover drama, comedy, sci-fi, and prestige TV — from classic sitcoms to modern streaming hits.

Select one of four choices and press Submit to lock in your answer. Each correct answer earns 100 points. After submitting, the correct answer is revealed. Press Next to continue.

Shows featured include: The Office, Breaking Bad, Game of Thrones, Stranger Things, Parks and Recreation, The Sopranos, Arrested Development, Lost, Community, Mad Men, Better Call Saul, Black Mirror, Friends, and many more fan favorites.

Questions test character names, show settings, famous quotes, plot details, and network origins. Use Settings to choose 10 or 20 questions. Questions are randomly drawn and shuffled each game so no two playthroughs are the same. Whether you are a casual viewer or a certified TV binge-watcher, this quiz has something to stump you!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TvShowQuizSettings),
  reducer, isTerminal, 
  hint: (state: TvShowQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TvShowQuiz,
};
