import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PopMusicQuizState, PopMusicQuizAction, PopMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PopMusicQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PopMusicQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const popMusicQuizPlugin: GamePlugin<PopMusicQuizState, PopMusicQuizAction, typeof settings> = {
  id:"pop-music-quiz", title:"Pop Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop hits and stars from Madonna and MJ to Britney and Taylor Swift.",
  howToPlay:`Pop Music Quiz tests your knowledge of the biggest names and biggest songs in popular music. Questions cover Madonna, Michael Jackson, Britney Spears, Taylor Swift, Beyoncé, Rihanna, Lady Gaga, the Spice Girls, and dozens more — plus chart-topping singles, debut albums, music videos, world tours, and pop culture moments that defined a generation.

You have 15 seconds per question. Each correct answer earns 100 base points plus 10 points per second remaining on the clock — answer fast to top the leaderboard. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. From boy bands to pop princesses, this quiz is one for radio lovers and playlist obsessives alike!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PopMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: PopMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PopMusicQuizGame,
};
