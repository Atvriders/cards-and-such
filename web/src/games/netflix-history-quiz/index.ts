import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NetflixHistoryQuizState, NetflixHistoryQuizAction, NetflixHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NetflixHistoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NetflixHistoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const netflixHistoryQuizPlugin: GamePlugin<NetflixHistoryQuizState, NetflixHistoryQuizAction, typeof settings> = {
  id:"netflix-history-quiz", title:"Netflix History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Netflix's evolution from DVD-by-mail to streaming giant.",
  howToPlay:"Netflix History Quiz tests your knowledge of how a 1997 DVD-by-mail service became the world's biggest streaming platform. Questions cover Reed Hastings, Marc Randolph, the famous Blockbuster decline, the streaming pivot, original content like House of Cards and Stranger Things, and the password-sharing crackdown era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From red envelopes to ad-tier subscriptions, this quiz spans the whole story.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NetflixHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: NetflixHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NetflixHistoryQuizGame,
};
