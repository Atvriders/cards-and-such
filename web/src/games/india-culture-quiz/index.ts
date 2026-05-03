import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IndiaCultureQuizState, IndiaCultureQuizAction, IndiaCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IndiaCultureQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IndiaCultureQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const indiaCultureQuizPlugin: GamePlugin<IndiaCultureQuizState, IndiaCultureQuizAction, typeof settings> = {
  id:"india-culture-quiz", title:"India Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Indian culture: Bollywood, festivals, regions, languages, and traditions.",
  howToPlay:"India Culture Quiz tests your knowledge of one of the world's most diverse civilizations. Questions span Bollywood blockbusters, classical music and dance forms, regional cuisines, the colorful festivals of Diwali, Holi, and Durga Puja, the major religions born in India, the geography of its 28 states, and famous Indian writers, scientists, and statesmen.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second remaining; wrong answers score zero but the right answer is shown.\n\nTap a choice and press Submit. Green means correct, red means wrong. Press Next to continue.\n\nChoose 10 or 20 questions in Settings. Whether you grew up watching Shah Rukh Khan, sampling vada pav at a Mumbai street stall, or just love a good chai conversation, this quiz will test your appreciation of India's vast and vibrant culture.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IndiaCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: IndiaCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:IndiaCultureQuizGame,
};
