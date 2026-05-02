import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HockeyRulesQuizState, HockeyRulesQuizAction, HockeyRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HockeyRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hockeyRulesQuizPlugin: GamePlugin<HockeyRulesQuizState, HockeyRulesQuizAction, typeof settings> = {
  id:"hockey-rules-quiz", title:"Hockey Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of ice hockey: offsides, icing, penalties, and overtime.",
  howToPlay:`Hockey Rules Quiz tests your knowledge of ice hockey. Expect questions on the basics (period length, players on the ice, goals scored), and the technical (offsides, icing, hybrid icing, the trapezoid behind the net, penalty shots, and shootouts).

You have 15 seconds per question. Correct answers earn 100 points plus 10 bonus points for every second on the clock. Wrong answers earn nothing.

Topics include rink dimensions (NHL vs. international), penalties (minor 2 minutes, major 5 minutes, misconducts), power plays, the goalie crease, the shootout format in regular-season overtime, the difference between a penalty shot and a shootout, and overtime rules in the playoffs vs. regular season.

Tap a choice, press Submit, then Next. Choose 10, 20, or 30 questions in Settings. Whether you're a Stanley Cup-watching hockey fan or a casual viewer who can't tell offsides from icing, this quiz will sharpen your understanding!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HockeyRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: HockeyRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HockeyRulesQuizGame,
};
