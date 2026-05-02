import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoccerRulesQuizState, SoccerRulesQuizAction, SoccerRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoccerRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const soccerRulesQuizPlugin: GamePlugin<SoccerRulesQuizState, SoccerRulesQuizAction, typeof settings> = {
  id:"soccer-rules-quiz", title:"Soccer Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of soccer: offside, fouls, free kicks, and match rules.",
  howToPlay:`Soccer Rules Quiz tests your knowledge of association football, the world's most popular sport. Questions cover the basics (number of players, length of a match, scoring) along with the technical: offside, direct vs. indirect free kicks, yellow and red cards, VAR, the offside trap, throw-ins, and penalty kicks.

You have 15 seconds per question. Correct answers earn 100 points plus 10 bonus points per second remaining on the clock. Speed and accuracy combine for the highest scores.

Topics include match duration (90 minutes plus stoppage), substitution rules (now 5 in most leagues), tournament rules (extra time and penalty shootouts), the dimensions of the goal (8 feet high, 24 feet wide), the penalty spot location (12 yards), and recent rule changes from IFAB.

Tap a choice, hit Submit, then Next. Choose 10, 20, or 30 questions in Settings. Whether you live for the Premier League, La Liga, the World Cup, or your local pickup, sharpen your game!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SoccerRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: SoccerRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SoccerRulesQuizGame,
};
