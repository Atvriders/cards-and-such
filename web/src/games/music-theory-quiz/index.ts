import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MusicTheoryQuizState, MusicTheoryQuizAction, MusicTheoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MusicTheoryQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MusicTheoryQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const musicTheoryQuizPlugin: GamePlugin<MusicTheoryQuizState, MusicTheoryQuizAction, typeof settings> = {
  id:"music-theory-quiz", title:"Music Theory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of music theory: scales, intervals, chords, and notation basics.",
  howToPlay:"Music Theory Quiz tests the fundamentals: scales, intervals, chord construction, key signatures, modes, cadences, and the rules that underpin Western music. Whether you're a curious listener, a self-taught songwriter, or a conservatory student, the questions cover the essentials every music nerd should know.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Brush up on diatonic chords, circle of fifths, and meter — your harmonic instincts will be tested!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MusicTheoryQuizSettings),
  reducer,isTerminal,
  hint: (state: MusicTheoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MusicTheoryQuizGame,
};
