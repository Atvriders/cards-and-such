import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MadonnaQuizState, MadonnaQuizAction, MadonnaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MadonnaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const madonnaQuizPlugin: GamePlugin<MadonnaQuizState, MadonnaQuizAction, typeof settings> = {
  id:"madonna-quiz", title:"Madonna Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Queen of Pop — Madonna's career, hits, and reinventions.",
  howToPlay:`Madonna Quiz tests your knowledge of the Queen of Pop. From her arrival on MTV with 'Like a Virgin' through 'Like a Prayer', the 'Vogue' era, the 'Ray of Light' reinvention, and her many Grammy- and Golden Globe-winning years, you'll be quizzed on songs, albums, films, marriages, controversies, and the moments that made Madonna an enduring cultural icon.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Express yourself!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MadonnaQuizSettings),
  reducer,isTerminal,component:MadonnaQuizGame,
};
