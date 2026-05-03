import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PassThePigsQuizState, PassThePigsQuizAction, PassThePigsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PassThePigsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PassThePigsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const passThePigsQuizPlugin: GamePlugin<PassThePigsQuizState, PassThePigsQuizAction, typeof settings> = {
  id:"pass-the-pigs-quiz", title:"Pass the Pigs Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pass the Pigs, the rubber-pig dice toss push-your-luck game.",
  howToPlay:"Pass the Pigs Trivia is a ten-question quiz about the iconic 1970s push-your-luck dice game where players toss two miniature rubber pig figurines and score points based on the resulting positions (Sider, Trotter, Razorback, Snouter, Leaning Jowler) until they bank or 'Pig Out'. Each round you'll be tested on the publisher Winning Moves / Hasbro / David Moffat, the 100-point race, the special positions, the famous 'Oinker' rule, and the game's history. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Pass the Pigs has charmed generations with its rubber barnyard chaos — see how much you remember.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PassThePigsQuizSettings),
  reducer,isTerminal,
  hint: (state: PassThePigsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PassThePigsQuizGame,
};
