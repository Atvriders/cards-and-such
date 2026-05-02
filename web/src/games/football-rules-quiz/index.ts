import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FootballRulesQuizState, FootballRulesQuizAction, FootballRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FootballRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const footballRulesQuizPlugin: GamePlugin<FootballRulesQuizState, FootballRulesQuizAction, typeof settings> = {
  id:"football-rules-quiz", title:"Football Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of American football: downs, yardage, penalties, and special teams.",
  howToPlay:`Football Rules Quiz tests your knowledge of American football's intricate rulebook. Expect questions on downs and distance, scoring (touchdowns, extra points, two-point conversions, field goals, safeties), penalties (offside, holding, pass interference, intentional grounding), and the play clock.

You have 15 seconds per question. Correct answers earn 100 points plus 10 points per second left on the clock. Wrong answers score nothing. The faster you answer, the higher your tally climbs.

Topics range from the basics (yards needed for a first down, length of the field, number of players per side) to the technical (illegal motion vs. illegal formation, when a play is dead, replay rules, and the catch rule). NFL, college, and high-school differences may show up too.

Tap a choice, press Submit, and Next moves you to the next question. Choose 10, 20, or 30 questions in Settings. Whether you're a die-hard tailgater or a casual Sunday viewer, sharpen your gridiron knowledge!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FootballRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: FootballRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FootballRulesQuizGame,
};
