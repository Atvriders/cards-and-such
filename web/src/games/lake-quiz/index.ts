import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LakeQuizState, LakeQuizAction, LakeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LakeQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LakeQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const lakeQuizPlugin: GamePlugin<LakeQuizState, LakeQuizAction, typeof settings> = {
  id:"lake-quiz", title:"Lake Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's famous lakes. 10 or 20 questions.",
  howToPlay:"Lake Quiz tests your knowledge of the planet's most famous bodies of fresh \u2014 and salt \u2014 water. The pool covers the giants (Caspian, Superior, Victoria, Baikal), the iconic (Loch Ness, Lake Como, Tahoe), and the geographically critical (Titicaca, Tanganyika, the Dead Sea).\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nSome classic gotchas: the Caspian Sea is the world's largest lake (despite the name \"sea\"). Lake Baikal is the deepest freshwater lake \u2014 and holds about 20 percent of the world's surface freshwater. Lake Superior is the largest Great Lake by area, but Michigan is the only one entirely in the US. The Dead Sea is one of the saltiest, but Don Juan Pond in Antarctica is even saltier.\n\nChoose 10 or 20 questions in Settings. From Highland mysteries to Andean altiplanos, plumb the depths of your geography knowledge!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LakeQuizSettings),
  reducer,isTerminal,
  hint: (state: LakeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LakeQuizGame,
};
