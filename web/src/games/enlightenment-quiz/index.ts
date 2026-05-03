import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EnlightenmentQuizState, EnlightenmentQuizAction, EnlightenmentQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EnlightenmentQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EnlightenmentQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const enlightenmentQuizPlugin: GamePlugin<EnlightenmentQuizState, EnlightenmentQuizAction, typeof settings> = {
  id:"enlightenment-quiz", title:"Enlightenment Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Age of Reason — philosophy, political theory, and the great thinkers.",
  howToPlay:`Enlightenment Quiz tests your knowledge of the 17th and 18th century intellectual revolution that reshaped Western thought. Questions cover key philosophers like Locke, Rousseau, Voltaire, Montesquieu, and Kant; foundational concepts like the social contract, natural rights, and separation of powers; and connections to the American and French Revolutions.

Each question offers four choices. Pick the correct one to earn 10 points. Green means right; red means wrong.

Press Next to continue. Choose 5, 10, or 15 questions in Settings.

Key facts: Locke's natural rights were life, liberty, and property; Montesquieu proposed separation of powers; Rousseau wrote the Social Contract; Hobbes wrote Leviathan; Descartes said "I think therefore I am"; Newton inspired Enlightenment faith in reason; Adam Smith wrote the Wealth of Nations. Master these to ace the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EnlightenmentQuizSettings),
  reducer,isTerminal,
  hint: (state: EnlightenmentQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:EnlightenmentQuizGame,
};
