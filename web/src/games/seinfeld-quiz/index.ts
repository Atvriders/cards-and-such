import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeinfeldState, SeinfeldAction, SeinfeldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SeinfeldQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SeinfeldQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const seinfeldQuizPlugin: GamePlugin<SeinfeldState, SeinfeldAction, typeof settings> = {
  id:"seinfeld-quiz", title:"Seinfeld Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Seinfeld: a show about nothing, with everyone you love.",
  howToPlay:"Seinfeld Quiz tests your knowledge of the legendary 'show about nothing' that ran from 1989 to 1998 on NBC. Questions span Jerry Seinfeld, George Costanza, Elaine Benes, Cosmo Kramer, and the endless cast of New Yorkers they collide with — Newman, Estelle, Frank, Mr. Pitt, the Soup Nazi, and many more.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10, 20, or 30 questions in Settings. Yada yada yada — your high score awaits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SeinfeldSettings),
  reducer,isTerminal,
  hint: (state: SeinfeldState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SeinfeldQuizGame,
};
