import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DragonballQuizState, DragonballQuizAction, DragonballQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DragonballQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DragonballQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dragonballQuizPlugin: GamePlugin<DragonballQuizState, DragonballQuizAction, typeof settings> = {
  id:"dragonball-quiz", title:"Dragon Ball Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Dragon Ball Z and Super lore: Saiyans, Ki blasts, transformations, and the Z-Fighters.",
  howToPlay:`Dragon Ball Quiz tests your knowledge of Akira Toriyama's iconic anime saga from Dragon Ball through Z, Super, and beyond. Questions cover the Saiyan saga, Frieza, Cell, Buu, and the Tournament of Power — Goku's transformations, Vegeta's pride, the Z-Fighters, the Namekians, the Kais, and every Super Saiyan form from the original golden hair to Ultra Instinct.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Whether you grew up watching Toonami or you're streaming Super on a phone today, this quiz proves who has the highest power level in trivia.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DragonballQuizSettings),
  reducer,isTerminal,
  hint: (state: DragonballQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DragonballQuizGame,
};
