import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EiffelTowerQuizState, EiffelTowerQuizAction, EiffelTowerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EiffelTowerQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EiffelTowerQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const eiffelTowerQuizPlugin: GamePlugin<EiffelTowerQuizState, EiffelTowerQuizAction, typeof settings> = {
  id:"eiffel-tower-quiz", title:"Eiffel Tower Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Eiffel Tower's history, design, and trivia.",
  howToPlay:`Eiffel Tower Quiz tests your knowledge of one of the world's most famous landmarks. Questions cover the tower's history — from its 1889 World's Fair debut to its current status as an icon of Paris and France. You'll be quizzed on the engineer Gustave Eiffel, the structure's wrought iron construction, and its incredible 41-year reign as the tallest building on Earth (1889 to 1930, when the Chrysler Building took the crown).

Topics include physical specs (~330m tall with antennas, 1,665 stairs, ~10,100 tons), painting maintenance (every 7 years!), the famous nightly light show that runs five minutes each hour, and the original 20-year planned lifespan that's been extended into perpetuity. The original Parisian artistic protests against its 'ugliness' get their nod too.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing. Tap, Submit, repeat.

Choose 10 or 20 questions in Settings. Vive la Tour Eiffel!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EiffelTowerQuizSettings),
  reducer,isTerminal,
  hint: (state: EiffelTowerQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:EiffelTowerQuizGame,
};
