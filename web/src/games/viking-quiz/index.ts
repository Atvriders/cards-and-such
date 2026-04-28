import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VikingQuizState, VikingQuizAction, VikingQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VikingQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const vikingQuizPlugin: GamePlugin<VikingQuizState, VikingQuizAction, typeof settings> = {
  id:"viking-quiz", title:"Viking Age Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Longships, sagas, and Norse exploration.",
  howToPlay:"Viking Age Quiz is a multiple-choice trivia game. Each question is drawn from a pool covering important people, places, dates, customs, technology, and turning points related to the topic. You'll get four answer choices labeled A through D — only one is correct.\n\nEach round you have 15 seconds to lock in an answer. Tap a choice, then press Submit. Correct answers earn a base of 100 points plus 10 points for every second left on the clock — so quick recall is rewarded handsomely. Wrong or timed-out answers score zero, and the right answer is always revealed before you continue.\n\nChoose your length in Settings: a quick 10-question round, a meaty 20-question game, or a marathon 30. Questions are shuffled and the answer order is randomized each game, so replays stay fresh. Whether you're brushing up on history or testing yourself for fun, this quiz is a fast, challenging way to sharpen your knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VikingQuizSettings),
  reducer,isTerminal,component:VikingQuizGame,
};
