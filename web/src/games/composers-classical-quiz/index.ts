import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComposersClassicalQuizState, ComposersClassicalQuizAction, ComposersClassicalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ComposersClassicalQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ComposersClassicalQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const composersClassicalQuizPlugin: GamePlugin<ComposersClassicalQuizState, ComposersClassicalQuizAction, typeof settings> = {
  id:"composers-classical-quiz", title:"Classical Composers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify the great Classical-period composers and their works.",
  howToPlay:"Classical Composers Quiz focuses on the Classical era proper (roughly 1750-1820): Haydn, Mozart, early Beethoven, Gluck, and contemporaries. Questions cover famous works, biography, instruments, the Viennese style, opera, and the symphonic and chamber-music tradition that crystallized in this period.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Mozart's operas to Haydn's symphonies, this quiz will make you appreciate the elegance of the late 18th century all over!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ComposersClassicalQuizSettings),
  reducer,isTerminal,
  hint: (state: ComposersClassicalQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ComposersClassicalQuizGame,
};
