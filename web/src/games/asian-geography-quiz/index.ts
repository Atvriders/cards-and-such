import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AsianGeographyQuizState, AsianGeographyQuizAction, AsianGeographyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AsianGeographyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AsianGeographyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const asianGeographyQuizPlugin: GamePlugin<AsianGeographyQuizState, AsianGeographyQuizAction, typeof settings> = {
  id:"asian-geography-quiz", title:"Asian Geography Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Capitals, mountains, rivers, and seas of the world's largest continent.",
  howToPlay:`Asian Geography Quiz tests your knowledge of the world's largest and most populous continent. Questions cover capitals from Tokyo to Tashkent, the Himalayan giants, the Caspian Sea, and the often-overlooked Central Asian Stans (Uzbekistan, Kyrgyzstan, Tajikistan).\n\nYou will be asked about Southeast Asia (Bangkok, Hanoi, Phnom Penh), South Asia (New Delhi, Dhaka, Kathmandu), East Asia (Beijing, Seoul, Pyongyang), and the Middle East fringe of Iran, Iraq, and Afghanistan.\n\nEach question has a 15-second timer. Correct answers earn 100 points plus a 10-point bonus per second remaining on the clock. Pick 10, 20, or 30 questions in Settings.\n\nIf you can name three of the five Stans without checking, you are doing well. If you can name all five plus their capitals, you are a geography champion. Prove it!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AsianGeographyQuizSettings),
  reducer,isTerminal,
  hint: (state: AsianGeographyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AsianGeographyQuizGame,
};
