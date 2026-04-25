import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SportsRulesQuizState, SportsRulesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SportsRulesQuiz } from "./SportsRulesQuiz.js";
export const sportsRulesQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof sportsRulesQuizSettings>;
export const sportsRulesQuizPlugin: GamePlugin<SportsRulesQuizState, SportsRulesQuizAction, typeof sportsRulesQuizSettings> = {
  id: "sports-rules-quiz", title: "Sports Rules Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the rules and numbers behind popular sports.",
  howToPlay: `Sports Rules Quiz tests your knowledge of the official rules, scores, and figures behind the world's most popular sports. Questions ask about team sizes, point values, scoring systems, field dimensions, and match lengths. Select the correct answer from four choices. Correct answers turn green; wrong ones turn red while the right answer is revealed. Earn 10 points per correct answer. Choose 5, 10, or 15 questions in settings. Sports covered include basketball, football, soccer, tennis, baseball, bowling, volleyball, cricket, rugby, and hockey. Tips: Learn the team sizes — 5 in basketball, 11 in soccer and football. Memorize key scoring: 6 for a touchdown, 3 for a field goal. Tennis and cricket have unique counting systems worth studying.`,
  settings: sportsRulesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, component: SportsRulesQuiz,
};
