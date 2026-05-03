import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WonderWomanQuizState, WonderWomanQuizAction, WonderWomanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WonderWomanQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WonderWomanQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wonderWomanQuizPlugin: GamePlugin<WonderWomanQuizState, WonderWomanQuizAction, typeof settings> = {
  id:"wonder-woman-quiz", title:"Wonder Woman Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Wonder Woman lore: Themyscira, Diana Prince, the Amazons, and Greek mythology.",
  howToPlay:`Wonder Woman Quiz tests your knowledge of DC Comics' Amazonian princess. Questions cover Diana Prince, Themyscira, Queen Hippolyta, the Amazons, the Lasso of Truth, Diana's bracelets, the invisible jet, Steve Trevor, Etta Candy, and her foes: Cheetah, Ares, Circe, the Cheetah, Doctor Psycho, and the gods of Olympus themselves.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. From William Moulton Marston's 1941 origin to Gal Gadot's modern films, see how well you know the world's most famous superheroine.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WonderWomanQuizSettings),
  reducer,isTerminal,
  hint: (state: WonderWomanQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WonderWomanQuizGame,
};
