import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FolkMusicQuizState, FolkMusicQuizAction, FolkMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FolkMusicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const folkMusicQuizPlugin: GamePlugin<FolkMusicQuizState, FolkMusicQuizAction, typeof settings> = {
  id:"folk-music-quiz", title:"Folk Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Folk traditions and revivals: Dylan, Baez, Guthrie, Seeger, and beyond.",
  howToPlay:`Folk Music Quiz spans the rich tradition of folk music, from American roots (Woody Guthrie, Pete Seeger) and the 1960s revival (Bob Dylan, Joan Baez, Peter, Paul and Mary) through contemporary indie folk (Fleet Foxes, Bon Iver, Mumford & Sons). Questions cover ballads, protest songs, the Newport Folk Festival, and the songwriters who shape the genre.

You have 15 seconds per question. Each correct answer earns 100 base points plus 10 per second remaining on the clock. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green, wrong ones turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Whether you favor old murder ballads or modern banjo bands, this quiz will sharpen your folk smarts!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FolkMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: FolkMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FolkMusicQuizGame,
};
