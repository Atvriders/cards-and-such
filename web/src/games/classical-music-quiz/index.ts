import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicalMusicQuizState, ClassicalMusicQuizAction, ClassicalMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClassicalMusicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const classicalMusicQuizPlugin: GamePlugin<ClassicalMusicQuizState, ClassicalMusicQuizAction, typeof settings> = {
  id:"classical-music-quiz", title:"Classical Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of classical music from Baroque through Romantic eras.",
  howToPlay:`Classical Music Quiz tests your knowledge of Western art music from the Baroque era through the early 20th century. Questions cover famous composers like Bach, Mozart, Beethoven, and Brahms; iconic symphonies, concertos, sonatas, and operas; musical periods and styles; and the great concert halls of the world.

You have 15 seconds per question. A correct answer earns 100 base points plus 10 points per second remaining on the clock. The faster you answer, the higher your score.

Select your answer and press Submit. Correct answers glow green; wrong answers turn red. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you attend the symphony regularly or simply love great music on streaming, Classical Music Quiz will deepen your appreciation of the concert repertoire!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClassicalMusicQuizSettings),
  reducer,isTerminal,component:ClassicalMusicQuizGame,
};
