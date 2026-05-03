import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComposersRomanticQuizState, ComposersRomanticQuizAction, ComposersRomanticQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ComposersRomanticQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ComposersRomanticQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const composersRomanticQuizPlugin: GamePlugin<ComposersRomanticQuizState, ComposersRomanticQuizAction, typeof settings> = {
  id:"composers-romantic-quiz", title:"Romantic Composers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify the giants of Romantic music: Chopin, Wagner, Brahms, Tchaikovsky.",
  howToPlay:"Romantic Composers Quiz covers roughly 1820-1900: the era of expanded orchestras, virtuoso pianists, nationalist movements, and giant operas. From Chopin's nocturnes to Wagner's Ring Cycle, from Brahms's symphonies to Tchaikovsky's ballets, the questions span the full romantic landscape.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Pour yourself something dramatic and dive into the century when music wore its heart on its sleeve!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ComposersRomanticQuizSettings),
  reducer,isTerminal,
  hint: (state: ComposersRomanticQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ComposersRomanticQuizGame,
};
