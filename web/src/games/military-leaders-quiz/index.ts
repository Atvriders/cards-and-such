import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MilLeadersState, MilLeadersAction, MilLeadersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MilitaryLeadersQuiz } from "./Game.js";

const settings = {
  questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const militaryLeadersQuizPlugin: GamePlugin<MilLeadersState, MilLeadersAction, typeof settings> = {
  id: "military-leaders-quiz",
  title: "Military Leaders Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's greatest military commanders — from Alexander the Great to WWII generals.",
  howToPlay: `Military Leaders Quiz spans three millennia of warfare, from the ancient world to the 20th century. Questions cover famous commanders, their key battles, the wars they fought, and the empires they built or defended.

You have 15 seconds to answer each question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Quick, confident answers score highest.

Click a choice to select it, then press Submit. After submitting, the correct answer highlights green and any wrong pick turns red. Press Next to advance.

Settings let you choose 10, 20, or 30 questions. Topics range from Hannibal's crossing of the Alps to Eisenhower's command of D-Day, from Sun Tzu to Georgy Zhukov. Key battles, nicknames, and strategic decisions are all fair game.

Whether you are a history buff, a strategy game fan, or simply curious about the people who shaped civilization through combat, Military Leaders Quiz will put your knowledge to the test!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as MilLeadersSettings),
  reducer,
  isTerminal,
  hint: (state: MilLeadersState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MilitaryLeadersQuiz,
};
