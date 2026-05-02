import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperBowlQuizState, SuperBowlQuizAction, SuperBowlQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperBowlQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const superBowlQuizPlugin: GamePlugin<SuperBowlQuizState, SuperBowlQuizAction, typeof settings> = {
  id:"super-bowl-quiz", title:"Super Bowl Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of NFL Super Bowl history.",
  howToPlay:"Super Bowl Quiz tests your knowledge of America's biggest sporting spectacle. Questions cover Super Bowl champions, MVP winners, halftime shows, iconic plays, dynasty teams, and unforgettable upsets from Super Bowl I to today.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Joe Montana to Tom Brady to Patrick Mahomes, the Super Bowl has crowned legends. Test yours and see if you have championship trivia DNA!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuperBowlQuizSettings),
  reducer,isTerminal,
  hint: (state: SuperBowlQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SuperBowlQuizGame,
};
