import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TeslaHistoryQuizState, TeslaHistoryQuizAction, TeslaHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TeslaHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TeslaHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const teslaHistoryQuizPlugin: GamePlugin<TeslaHistoryQuizState, TeslaHistoryQuizAction, typeof settings> = {
  id:"tesla-history-quiz", title:"Tesla History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Tesla Motors' founding, products, and Elon Musk era.",
  howToPlay:"Tesla History Quiz tests your knowledge of the electric vehicle pioneer. Questions span the 2003 Martin Eberhard and Marc Tarpenning founding, Elon Musk's investment and CEO role, the Roadster, Model S/3/X/Y, the Cybertruck, the Gigafactories, the autopilot tech, the Solar Roof, and the company's wild stock saga.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From the Roadster to Cybertruck, this quiz spans the whole journey.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TeslaHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: TeslaHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TeslaHistoryQuizGame,
};
