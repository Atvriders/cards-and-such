import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ItalyCultureQuizState, ItalyCultureQuizAction, ItalyCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ItalyCultureQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ItalyCultureQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const italyCultureQuizPlugin: GamePlugin<ItalyCultureQuizState, ItalyCultureQuizAction, typeof settings> = {
  id:"italy-culture-quiz", title:"Italy Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Italian culture: food, art, regions, opera, and history.",
  howToPlay:"Italy Culture Quiz tests your knowledge of la dolce vita. Questions cover Renaissance masters like Michelangelo and Leonardo, regional cuisines from Naples to Milan, opera composers including Verdi and Puccini, ancient Rome's emperors and engineering, the unification under Garibaldi, modern football, fashion houses, and the geography of its twenty regions.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second remaining; wrong answers score zero but reveal the right answer.\n\nTap a choice and press Submit. Green means correct, red means wrong. Press Next to continue.\n\nChoose 10 or 20 questions in Settings. Whether you're a tifosi rooting for Juventus, a foodie obsessed with carbonara, or an art lover who has lost themselves in the Sistine Chapel, this quiz will test how molto bene your Italian cultural literacy really is.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ItalyCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: ItalyCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ItalyCultureQuizGame,
};
