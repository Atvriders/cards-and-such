import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TennisRulesQuizState, TennisRulesQuizAction, TennisRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TennisRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tennisRulesQuizPlugin: GamePlugin<TennisRulesQuizState, TennisRulesQuizAction, typeof settings> = {
  id:"tennis-rules-quiz", title:"Tennis Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of tennis: scoring, serves, lets, faults, and tournament play.",
  howToPlay:`Tennis Rules Quiz tests your knowledge of the unique tennis scoring system and rulebook. Expect questions on scoring (15-30-40-game, deuce, advantage, sets, tiebreaks), serves (faults, double-faults, lets), and the various tournament formats (Grand Slam best-of-five for men, best-of-three for women).

You have 15 seconds per question. Correct answers earn 100 points plus 10 bonus points per second left on the clock. Wrong answers earn zero.

Topics include the dimensions of a tennis court (78 feet long, 27 feet wide for singles), net height (3 feet at center), the modern tiebreak (first to 7, win by 2), super-tiebreaks, surface differences (grass, clay, hard), challenge systems (Hawk-Eye), and recent rule changes — like the third-set match tiebreak in Grand Slams.

Tap, Submit, Next. Choose 10, 20, or 30 questions in Settings. From Wimbledon to your local park courts, sharpen your tennis IQ!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TennisRulesQuizSettings),
  reducer,isTerminal,component:TennisRulesQuizGame,
};
