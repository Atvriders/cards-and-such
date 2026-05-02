import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldRiversQuizState, WorldRiversQuizAction, WorldRiversQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldRiversQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldRiversQuizPlugin: GamePlugin<WorldRiversQuizState, WorldRiversQuizAction, typeof settings> = {
  id:"world-rivers-quiz", title:"World Rivers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lengths, basins, and famous waterways across every continent.",
  howToPlay:`World Rivers Quiz tests your knowledge of the great waterways of the world. Questions cover the longest rivers (Nile, Amazon, Yangtze, Mississippi-Missouri), the iconic city rivers (Thames in London, Seine in Paris, Tiber in Rome), and the dramatic rivers that carved continents (Colorado through the Grand Canyon, Zambezi over Victoria Falls).\n\nYou will be asked which sea or ocean each river empties into, which countries it runs through, and which famous landmarks line its banks.\n\nEach question has a 15-second timer. Correct answers earn 100 base points plus a 10-point bonus per second remaining. Choose 10, 20, or 30 questions in Settings.\n\nFrom the Mekong's six-country journey to the Murray's lonely path through Australia, this quiz spans the planet's most important arteries. If you can name the river that empties into the Caspian, you are doing better than most!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldRiversQuizSettings),
  reducer,isTerminal,
  hint: (state: WorldRiversQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WorldRiversQuizGame,
};
