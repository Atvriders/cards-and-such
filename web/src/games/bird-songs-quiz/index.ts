import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BirdSongsQuizState, BirdSongsQuizAction, BirdSongsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BirdSongsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const birdSongsQuizPlugin: GamePlugin<BirdSongsQuizState, BirdSongsQuizAction, typeof settings> = {
  id:"bird-songs-quiz", title:"Bird Songs Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify birds by their songs, calls, and vocalizations.",
  howToPlay:"Bird Songs Quiz is a delightful test of your ear for North American (and a few global) bird vocalizations. Each question describes or names a famous song or call — the trill of a chickadee, the haunting flute of a wood thrush, the laugh of a kookaburra — and you choose which species sings it. Whether you're a backyard birder or a serious lister, this quiz will sharpen your audio identification.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice and press Submit. The right answer is revealed before you continue. Whether you're trying to ID the dawn chorus or just love nature's own jukebox, this quiz turns up the volume on the world's wild orchestra.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BirdSongsQuizSettings),
  reducer,isTerminal,
  hint: (state: BirdSongsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BirdSongsQuizGame,
};
