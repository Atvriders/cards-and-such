import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen30sQuizState, Nineteen30sQuizAction, Nineteen30sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nineteen30sQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Nineteen30sQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen30sQuizPlugin: GamePlugin<Nineteen30sQuizState, Nineteen30sQuizAction, typeof settings> = {
  id:"1930s-quiz", title:"1930s Great Depression Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"From the Great Depression to the New Deal — explore the 1930s.",
  howToPlay:`1930s Great Depression Quiz tests your knowledge of FDR's New Deal, the Dust Bowl, the rise of fascism in Europe, the golden age of radio, and iconic films like King Kong and The Wizard of Oz. From breadlines to swing music, the decade reshaped America.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen30sQuizSettings),
  reducer,isTerminal,
  hint: (state: Nineteen30sQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Nineteen30sQuizGame,
};
