import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldCupQuizState, WorldCupQuizAction, WorldCupQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldCupQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldCupQuizPlugin: GamePlugin<WorldCupQuizState, WorldCupQuizAction, typeof settings> = {
  id:"world-cup-quiz", title:"World Cup Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of FIFA World Cup history.",
  howToPlay:"World Cup Quiz tests your knowledge of football's greatest tournament. Questions cover champions, host nations, golden boots, iconic goals, legendary squads, and the dramatic finals that have defined the FIFA World Cup since 1930.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you remember Pelé's first triumph or Messi's final coronation, World Cup Quiz is your stadium. Lift the trophy of trivia!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldCupQuizSettings),
  reducer,isTerminal,component:WorldCupQuizGame,
};
