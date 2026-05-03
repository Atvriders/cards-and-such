import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GospelMusicQuizState, GospelMusicQuizAction, GospelMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GospelMusicQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GospelMusicQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gospelMusicQuizPlugin: GamePlugin<GospelMusicQuizState, GospelMusicQuizAction, typeof settings> = {
  id:"gospel-music-quiz", title:"Gospel Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Traditional and contemporary gospel: Mahalia Jackson, choirs, and stars.",
  howToPlay:`Gospel Music Quiz celebrates the spirit-filled tradition that birthed soul, R&B, and so much modern American music. Questions cover Mahalia Jackson, Sister Rosetta Tharpe, Thomas A. Dorsey, the Clark Sisters, James Cleveland, Andraé Crouch, Kirk Franklin, Yolanda Adams, and contemporary stars like Tasha Cobbs Leonard.

You have 15 seconds per question. A correct answer awards 100 base points plus 10 points per second remaining on the clock. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong choices turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Let your spirit and your trivia chops both rise — this quiz is a praise break!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GospelMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: GospelMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GospelMusicQuizGame,
};
