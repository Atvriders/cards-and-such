import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FacebookHistoryQuizState, FacebookHistoryQuizAction, FacebookHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FacebookHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FacebookHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const facebookHistoryQuizPlugin: GamePlugin<FacebookHistoryQuizState, FacebookHistoryQuizAction, typeof settings> = {
  id:"facebook-history-quiz", title:"Facebook/Meta History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Facebook/Meta's founding, growth, and pivots.",
  howToPlay:"Facebook/Meta History Quiz tests your knowledge of the social network that grew from a Harvard dorm room into a global juggernaut. Questions span Mark Zuckerberg's 2004 launch, Eduardo Saverin's role, the IPO, Instagram and WhatsApp acquisitions, Cambridge Analytica, the rebrand to Meta, the metaverse vision, and the present-day AI/Threads era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From poking to the metaverse, this quiz hits every era.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FacebookHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: FacebookHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FacebookHistoryQuizGame,
};
