import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwimmingEventsQuizState, SwimmingEventsQuizAction, SwimmingEventsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SwimmingEventsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SwimmingEventsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const swimmingEventsQuizPlugin: GamePlugin<SwimmingEventsQuizState, SwimmingEventsQuizAction, typeof settings> = {
  id:"swimming-events-quiz", title:"Swimming Events Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of swimming events, strokes, and Olympic legends.",
  howToPlay:`Swimming Events Quiz tests your knowledge of competitive swimming. Questions cover the four strokes (freestyle, backstroke, breaststroke, butterfly), individual medley orders, relay formats, and the differences between long-course (50m) and short-course (25m) pools.

Topics include legendary swimmers — Michael Phelps, Mark Spitz, Ian Thorpe, Katie Ledecky, Caeleb Dressel — as well as records, pool dimensions, lane counts, and tech advancements (and bans) like the 2010 full-body suit prohibition. You'll see questions about Olympic distance events from the 50m sprint to the 1500m and 10km open water marathon.

You have 15 seconds per question. Correct answers award 100 base points plus 10 per second remaining; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed before you continue.

Choose 10 or 20 questions in Settings. Whether you swim laps yourself or just love watching the records fall every Olympics, dive in — the water's fast!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SwimmingEventsQuizSettings),
  reducer,isTerminal,
  hint: (state: SwimmingEventsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SwimmingEventsQuizGame,
};
