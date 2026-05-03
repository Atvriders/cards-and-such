import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YutNoriState, YutNoriAction, YutNoriSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YutNoriGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YutNoriGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const yutNoriPlugin: GamePlugin<YutNoriState, YutNoriAction, typeof settings> = {
  id:"yut-nori-quiz", title:"Yut Nori Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Yut Nori, Korea's classic stick-throwing race game.",
  howToPlay:"Yut Nori is the Korean traditional board game played mainly during Lunar New Year. Teams or individuals throw four 'yut' sticks — each flat on one side and curved on the other — to determine how their tokens move around a cross-shaped track. The combinations of flat and curved sides yield five possible scores: Do, Gae, Geol, Yut, and Mo. Players try to bring all their tokens home first; capturing an opponent's token earns a free extra throw.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YutNoriSettings),
  reducer,isTerminal,
  hint: (state: YutNoriState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:YutNoriGame,
};
