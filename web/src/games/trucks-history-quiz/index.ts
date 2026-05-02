import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrucksHistoryQuizState, TrucksHistoryQuizAction, TrucksHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrucksHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trucksHistoryQuizPlugin: GamePlugin<TrucksHistoryQuizState, TrucksHistoryQuizAction, typeof settings> = {
  id:"trucks-history-quiz", title:"Trucks History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of trucking and pickup truck history.",
  howToPlay:"Trucks History Quiz tests your knowledge of pickups, big rigs, and the workhorses that built modern industry. From Ford's Model TT and the first F-Series to Peterbilts hauling cross-country and modern half-tons towing the family camper, trucks have shaped commerce and culture alike.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a long-haul driver or just a fan of haul-it-yourself weekends, gear up for some serious trivia!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrucksHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: TrucksHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrucksHistoryQuizGame,
};
