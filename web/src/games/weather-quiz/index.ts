import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WeatherQuizState, WeatherQuizAction, WeatherQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WeatherQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WeatherQuiz as unknown as React.ComponentType<unknown> })));
const weatherQuizSettings = {
  questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const },
} as const;
type S = SettingsOf<typeof weatherQuizSettings>;

export const weatherQuizPlugin: GamePlugin<WeatherQuizState, WeatherQuizAction, typeof weatherQuizSettings> = {
  id: "weather-quiz",
  title: "Weather Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your meteorology knowledge — clouds, storms, pressure, and climate phenomena.",
  howToPlay: `Weather Quiz tests your knowledge of meteorology and atmospheric science. From cloud types and storm systems to pressure measurements and global wind patterns, each question probes a different aspect of how weather works.

Select an answer from the four choices and press Submit. A correct answer earns 100 points. After each question the correct answer is highlighted so you can learn from any mistakes.

Topics include: cloud classification (cirrus, stratus, cumulonimbus), storm types (hurricanes, tornadoes, blizzards), measuring instruments (barometer, hygrometer, anemometer), atmospheric layers, fronts and their weather patterns, the Coriolis effect, El Niño, rainbows, dew point, and the Beaufort wind scale.

Choose 10 or 20 questions in Settings. Maximum score is 2000 with 20 questions. Whether you are a casual observer of the sky or a budding meteorologist, Weather Quiz will sharpen your understanding of the atmosphere above us!`,
  settings: weatherQuizSettings,
  initialState: (seed:number, settings:S) => initialState(seed, settings as WeatherQuizSettings),
  reducer,
  isTerminal,
  hint: (state: WeatherQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: WeatherQuiz,
};
