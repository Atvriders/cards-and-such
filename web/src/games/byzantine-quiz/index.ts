import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ByzantineQuizState, ByzantineQuizAction, ByzantineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ByzantineQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ByzantineQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const byzantineQuizPlugin: GamePlugin<ByzantineQuizState, ByzantineQuizAction, typeof settings> = {
  id:"byzantine-quiz", title:"Byzantine Empire Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Constantinople, Justinian, and a thousand-year empire.",
  howToPlay:"Byzantine Empire Quiz is a multiple-choice trivia game. Each question is drawn from a pool covering important people, places, dates, customs, technology, and turning points related to the topic. You'll get four answer choices labeled A through D — only one is correct.\n\nEach round you have 15 seconds to lock in an answer. Tap a choice, then press Submit. Correct answers earn a base of 100 points plus 10 points for every second left on the clock — so quick recall is rewarded handsomely. Wrong or timed-out answers score zero, and the right answer is always revealed before you continue.\n\nChoose your length in Settings: a quick 10-question round, a meaty 20-question game, or a marathon 30. Questions are shuffled and the answer order is randomized each game, so replays stay fresh. Whether you're brushing up on history or testing yourself for fun, this quiz is a fast, challenging way to sharpen your knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ByzantineQuizSettings),
  reducer,isTerminal,
  hint: (state: ByzantineQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ByzantineQuizGame,
};
