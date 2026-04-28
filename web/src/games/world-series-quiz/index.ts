import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldSeriesQuizState, WorldSeriesQuizAction, WorldSeriesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldSeriesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldSeriesQuizPlugin: GamePlugin<WorldSeriesQuizState, WorldSeriesQuizAction, typeof settings> = {
  id:"world-series-quiz", title:"World Series Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of MLB World Series history.",
  howToPlay:"World Series Quiz tests your knowledge of baseball's Fall Classic. Questions cover champion teams, MVP winners, walk-off heroes, dynasty rosters, curse-breakers, and iconic Game Sevens spanning over a century of October baseball.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Babe Ruth's called shot to Kirk Gibson's homer to the 2016 Cubs ending the Curse of the Billy Goat, World Series Quiz is the ultimate test for baseball lifers.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldSeriesQuizSettings),
  reducer,isTerminal,component:WorldSeriesQuizGame,
};
