import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldCapitalsQuizState, WorldCapitalsQuizAction, WorldCapitalsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldCapitalsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldCapitalsQuizPlugin: GamePlugin<WorldCapitalsQuizState, WorldCapitalsQuizAction, typeof settings> = {
  id:"world-capitals-quiz", title:"World Capitals Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"How well do you know your world capitals? Match the country to its capital city.",
  howToPlay:`World Capitals Quiz challenges your geographic knowledge of national capitals from every continent. From Paris and Tokyo to Brasilia and Canberra, you'll be tested on the seats of power across Europe, Asia, Africa, the Americas, and Oceania.

Each question gives you four city options. Pick the correct capital before your 15-second timer expires. You earn 100 points for a correct answer plus a 10-point bonus for every second remaining on the clock — so quick thinking pays off.

Tap your answer, then press Submit. The correct answer is always revealed, glowing green. If you picked wrong, your choice will turn red so you can learn for next time. Press Next to continue to the following question.

Choose 10, 20, or 30 questions in Settings. Whether you're a seasoned globetrotter or a casual map nerd, this quiz will sharpen your knowledge of cities like Riyadh, Hanoi, Lima, and Reykjavik.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldCapitalsQuizSettings),
  reducer,isTerminal,component:WorldCapitalsQuizGame,
};
