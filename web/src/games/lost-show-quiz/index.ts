import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LostShowState, LostShowAction, LostShowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LostShowQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const lostShowQuizPlugin: GamePlugin<LostShowState, LostShowAction, typeof settings> = {
  id:"lost-show-quiz", title:"LOST Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of LOST: the island, the Others, the smoke monster, and the numbers.",
  howToPlay:"LOST Quiz tests your knowledge of J.J. Abrams and Damon Lindelof's groundbreaking ABC mystery drama about the survivors of Oceanic Flight 815, stranded on a strange island in the South Pacific. Questions span all six seasons — Jack, Kate, Sawyer, Hurley, Locke, Sayid, Charlie, Sun, Jin, Desmond, Ben, Jacob, the Dharma Initiative, the Others, the Smoke Monster, and that infamous sequence: 4 8 15 16 23 42.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. We have to go back!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LostShowSettings),
  reducer,isTerminal,component:LostShowQuizGame,
};
