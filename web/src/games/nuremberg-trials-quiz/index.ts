import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NurembergTrialsQuizState, NurembergTrialsQuizAction, NurembergTrialsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NurembergTrialsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NurembergTrialsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nurembergTrialsQuizPlugin: GamePlugin<NurembergTrialsQuizState, NurembergTrialsQuizAction, typeof settings> = {
  id:"nuremberg-trials-quiz", title:"Nuremberg Trials Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the post-WWII Nuremberg trials.",
  howToPlay:"Nuremberg Trials Quiz covers the historic trials held in Nuremberg, Germany, after World War II to prosecute prominent Nazi leaders. Beginning in 1945, the trials established new principles of international law including 'crimes against humanity' and 'crimes against peace,' shaping post-war justice.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Hermann Göring to Albert Speer, from Justice Jackson to the simultaneous translators, the Nuremberg Trials reshaped the meaning of justice.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NurembergTrialsQuizSettings),
  reducer,isTerminal,
  hint: (state: NurembergTrialsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NurembergTrialsQuizGame,
};
