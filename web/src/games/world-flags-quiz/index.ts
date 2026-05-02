import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldFlagsQuizState, WorldFlagsQuizAction, WorldFlagsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldFlagsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldFlagsQuizPlugin: GamePlugin<WorldFlagsQuizState, WorldFlagsQuizAction, typeof settings> = {
  id:"world-flags-quiz", title:"World Flags Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify world flags from their colors, patterns, and symbols.",
  howToPlay:`World Flags Quiz challenges you to recognize national flags from around the world by their distinctive colors, layouts, and symbols. Questions describe each flag in plain language — the maple leaf on Canada's, the rising sun on Japan's, the crescent and star on Turkey's — and ask you to pick the correct nation.\n\nYou will be tested on tricky look-alikes: Russia's stripes versus Netherlands' versus France's. Sweden's vs Finland's Nordic crosses. China's five stars vs Vietnam's single star. Romania, Chad, and Andorra all share suspicious resemblances.\n\nEach question gives you 15 seconds. Correct answers earn 100 points plus a 10-point bonus per second remaining on the clock. Choose 10, 20, or 30 questions in Settings.\n\nIf you can spot the difference between Indonesia's flag and Monaco's, or call out Bhutan's golden dragon, you are well on your way to vexillology stardom!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldFlagsQuizSettings),
  reducer,isTerminal,
  hint: (state: WorldFlagsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WorldFlagsQuizGame,
};
