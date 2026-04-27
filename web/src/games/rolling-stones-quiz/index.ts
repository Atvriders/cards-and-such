import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollingStonesQuizState, RollingStonesQuizAction, RollingStonesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollingStonesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const rollingStonesQuizPlugin: GamePlugin<RollingStonesQuizState, RollingStonesQuizAction, typeof settings> = {
  id:"rolling-stones-quiz", title:"Rolling Stones Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the World's Greatest Rock 'n' Roll Band.",
  howToPlay:`Rolling Stones Quiz tests your knowledge of the World's Greatest Rock 'n' Roll Band. From their formation in 1962 through Brian Jones, Mick Taylor, and Ron Wood guitar eras, you'll be quizzed on hit singles like 'Satisfaction' and 'Brown Sugar', landmark albums like 'Exile on Main St.', tragedies like Altamont, the iconic tongue logo, and the longtime partnership of Mick Jagger and Keith Richards.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Start me up!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RollingStonesQuizSettings),
  reducer,isTerminal,component:RollingStonesQuizGame,
};
