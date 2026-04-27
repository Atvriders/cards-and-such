import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RugbyRulesQuizState, RugbyRulesQuizAction, RugbyRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RugbyRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const rugbyRulesQuizPlugin: GamePlugin<RugbyRulesQuizState, RugbyRulesQuizAction, typeof settings> = {
  id:"rugby-rules-quiz", title:"Rugby Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of rugby: tries, scrums, lineouts, and union vs. league.",
  howToPlay:`Rugby Rules Quiz tests your knowledge of rugby — both union and league. Questions cover scoring (tries, conversions, penalty kicks, drop goals), the basics (number of players, match length), and the technical (the breakdown, scrums, lineouts, the offside rule, and the differences between rugby union and rugby league).

You have 15 seconds per question. Correct answers score 100 points plus 10 bonus points per second left on the clock. Wrong answers earn zero.

Topics span pitch dimensions, field-position phrases (22, halfway, try line), set pieces (lineouts and scrums), penalties (high tackles, dangerous play, repeated infringements), and rule differences between sevens, fifteens, and rugby league. The Rugby World Cup is held every four years; questions about international competitions appear too.

Tap, Submit, Next. Choose 10, 20, or 30 questions in Settings. From Twickenham to the All Blacks, sharpen your rugby knowledge!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RugbyRulesQuizSettings),
  reducer,isTerminal,component:RugbyRulesQuizGame,
};
