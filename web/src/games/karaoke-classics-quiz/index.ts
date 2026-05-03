import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KaraokeClassicsQuizState, KaraokeClassicsQuizAction, KaraokeClassicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KaraokeClassicsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KaraokeClassicsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const karaokeClassicsQuizPlugin: GamePlugin<KaraokeClassicsQuizState, KaraokeClassicsQuizAction, typeof settings> = {
  id:"karaoke-classics-quiz", title:"Karaoke Classics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the all-time karaoke favorites everyone sings.",
  howToPlay:"Karaoke Classics Quiz celebrates the songs that pack out karaoke nights everywhere. Questions cover the perennial favorites — 'Don't Stop Believin'', 'I Will Survive', 'Bohemian Rhapsody', 'Sweet Caroline', 'Total Eclipse of the Heart' — and the artists, lyrics, and chord progressions that make them unforgettable for amateurs and pros alike.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Bring your courage and your high notes — Karaoke Classics is here!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KaraokeClassicsQuizSettings),
  reducer,isTerminal,
  hint: (state: KaraokeClassicsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KaraokeClassicsQuizGame,
};
