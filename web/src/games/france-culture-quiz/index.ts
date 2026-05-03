import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FranceCultureQuizState, FranceCultureQuizAction, FranceCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FranceCultureQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FranceCultureQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const franceCultureQuizPlugin: GamePlugin<FranceCultureQuizState, FranceCultureQuizAction, typeof settings> = {
  id:"france-culture-quiz", title:"France Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"French culture: cuisine, art, history, fashion, and language.",
  howToPlay:"France Culture Quiz explores the language, food, art, and history of one of Europe's most influential nations. Questions cover impressionism and the Louvre, Parisian landmarks like the Eiffel Tower and Notre-Dame, gastronomic icons including baguettes, croissants, escargot, and the wines of Bordeaux and Burgundy. You'll also test your knowledge of French monarchs, the Revolution, Napoleonic era, World War history, and modern Fifth Republic politics.\n\nEach question has a 15-second timer. Correct answers award 100 points plus 10 per second remaining. Wrong answers score zero, but the right answer is revealed.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you've sipped espresso on the Champs-Elysées or just love a good baguette, this quiz will challenge your savoir-faire on all things français.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FranceCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: FranceCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FranceCultureQuizGame,
};
