import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PulitzerQuizState, PulitzerQuizAction, PulitzerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PulitzerQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PulitzerQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pulitzerQuizPlugin: GamePlugin<PulitzerQuizState, PulitzerQuizAction, typeof settings> = {
  id:"pulitzer-quiz", title:"Pulitzer Prize Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Pulitzer Prize.",
  howToPlay:"Pulitzer Prize Quiz tests your knowledge of America's most prestigious journalism, literature and music honor. Established by Joseph Pulitzer's bequest and first awarded in 1917, the Pulitzers are administered by Columbia University.\n\nQuestions cover the journalism categories (Public Service, Investigative, Breaking News, Feature Writing), letters categories (Fiction, Drama, Biography, Poetry, History, General Nonfiction), Pulitzer-winning newspapers like the New York Times and Washington Post, and famous winners — Toni Morrison, Hemingway, Lin-Manuel Miranda, Margaret Atwood (no, that one's Booker), Bob Dylan, and Kendrick Lamar's groundbreaking 2018 Music win.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PulitzerQuizSettings),
  reducer,isTerminal,
  hint: (state: PulitzerQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PulitzerQuizGame,
};
