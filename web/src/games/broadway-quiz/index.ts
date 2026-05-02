import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BroadwayQuizState, BroadwayQuizAction, BroadwayQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BroadwayQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const broadwayQuizPlugin: GamePlugin<BroadwayQuizState, BroadwayQuizAction, typeof settings> = {
  id:"broadway-quiz", title:"Broadway Musicals Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Broadway musicals: from Sondheim and Lloyd Webber to current Tony winners.",
  howToPlay:`Broadway Musicals Quiz tests your knowledge of the Great White Way. From the Golden Age of Rodgers & Hammerstein through Sondheim, Lloyd Webber, Disney, and modern hits like Hamilton, Dear Evan Hansen, and Hadestown — questions cover Tony winners, signature songs, opening years, theatres, and the lyricists, composers, and stars who lit up Times Square.

You have 15 seconds per question. Correct answers award 100 base points plus 10 per second remaining on the clock. Wrong answers earn no points.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the correct answer is revealed before you advance. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. From the wings of the St. James Theatre, places, please — and break a leg!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BroadwayQuizSettings),
  reducer,isTerminal,
  hint: (state: BroadwayQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BroadwayQuizGame,
};
