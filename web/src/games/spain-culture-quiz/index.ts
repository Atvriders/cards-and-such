import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpainCultureQuizState, SpainCultureQuizAction, SpainCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpainCultureQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpainCultureQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spainCultureQuizPlugin: GamePlugin<SpainCultureQuizState, SpainCultureQuizAction, typeof settings> = {
  id:"spain-culture-quiz", title:"Spain Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spanish culture: flamenco, food, festivals, and regional traditions.",
  howToPlay:"Spain Culture Quiz tests your knowledge of España's rich heritage. Questions cover flamenco's gypsy roots, tapas culture from Sevilla to San Sebastián, paella's Valencian origins, the Reconquista and Moorish Andalusia, the Spanish Empire and conquistadors, twentieth-century history including the Civil War and Franco era, plus modern royal family, La Liga football giants, and architectural icons like Gaudí's Sagrada Familia.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second remaining; wrong answers score zero but reveal the answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you've run with the bulls in Pamplona, danced flamenco in Triana, or just love a good Rioja, this quiz will challenge your Spanish cultural know-how.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpainCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: SpainCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpainCultureQuizGame,
};
