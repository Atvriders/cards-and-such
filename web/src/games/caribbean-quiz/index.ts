import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaribbeanQuizState, CaribbeanQuizAction, CaribbeanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CaribbeanQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CaribbeanQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const caribbeanQuizPlugin: GamePlugin<CaribbeanQuizState, CaribbeanQuizAction, typeof settings> = {
  id:"caribbean-quiz", title:"Caribbean Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Islands, capitals, and history of the Caribbean Sea.",
  howToPlay:`Caribbean Quiz tests your knowledge of the islands and nations of the Caribbean Sea. From the Greater Antilles giants — Cuba, Hispaniola, Jamaica, Puerto Rico — to the dozens of smaller island states like Barbados, Saint Lucia, Antigua, and Saint Kitts and Nevis.\n\nQuestions cover capitals (Havana, Kingston, Bridgetown), colonial history (Spanish, French, British, Dutch territories), music (reggae, calypso), and the cultural icons born there. There are also questions about Bermuda (which technically is not Caribbean), the Cayman Islands, and the Virgin Islands (both British and US).\n\nEach question has a 15-second timer; correct answers earn 100 points plus 10 per remaining second. Choose 10, 20, or 30 questions in Settings.\n\nIf you can keep Saint Kitts straight from Saint Lucia, Saint Vincent from Saint Martin, you are doing better than most. Now grab your sunscreen and dive in!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaribbeanQuizSettings),
  reducer,isTerminal,
  hint: (state: CaribbeanQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CaribbeanQuizGame,
};
