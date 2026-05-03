import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpidermanQuizState, SpidermanQuizAction, SpidermanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpidermanQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpidermanQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spidermanQuizPlugin: GamePlugin<SpidermanQuizState, SpidermanQuizAction, typeof settings> = {
  id:"spiderman-quiz", title:"Spider-Man Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Spider-Man lore: Peter Parker, the spider-bite, the Daily Bugle, and the Sinister Six.",
  howToPlay:`Spider-Man Quiz tests your knowledge of Marvel's friendly neighborhood wallcrawler. Questions cover Peter Parker, Aunt May, Uncle Ben's lesson, Mary Jane, Gwen Stacy, the Daily Bugle, J. Jonah Jameson, the radioactive spider, web-shooters, and the Sinister Six's villains: Green Goblin, Doctor Octopus, Vulture, Sandman, Mysterio, Electro, Lizard, Kraven, Venom, and Carnage.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. With great power comes great trivia — let's see if your spider-sense is tingling!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpidermanQuizSettings),
  reducer,isTerminal,
  hint: (state: SpidermanQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpidermanQuizGame,
};
