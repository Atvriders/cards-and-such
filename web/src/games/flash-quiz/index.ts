import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashQuizState, FlashQuizAction, FlashQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FlashQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FlashQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const flashQuizPlugin: GamePlugin<FlashQuizState, FlashQuizAction, typeof settings> = {
  id:"flash-quiz", title:"The Flash Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Flash lore: Speed Force, Central City, Rogues, and the Multiverse.",
  howToPlay:`The Flash Quiz tests your knowledge of DC Comics' fastest man alive. Questions cover Barry Allen, Wally West, Jay Garrick, Bart Allen, the Speed Force, Central City, the Rogues — Captain Cold, Heat Wave, Mirror Master, Trickster, Weather Wizard — Professor Zoom and Reverse-Flash, the Flashpoint event, and the Multiverse-shattering Crisis on Infinite Earths.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Tap fast — but don't run circles around the wrong answer.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlashQuizSettings),
  reducer,isTerminal,
  hint: (state: FlashQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FlashQuizGame,
};
