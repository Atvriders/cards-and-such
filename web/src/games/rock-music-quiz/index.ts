import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RockMusicQuizState, RockMusicQuizAction, RockMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RockMusicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const rockMusicQuizPlugin: GamePlugin<RockMusicQuizState, RockMusicQuizAction, typeof settings> = {
  id:"rock-music-quiz", title:"Rock Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of rock — from the Beatles and Stones to grunge and alt rock.",
  howToPlay:`Rock Music Quiz puts your knowledge of rock and roll to the test, from the British Invasion to modern alternative. Questions cover the Beatles, Rolling Stones, Led Zeppelin, Pink Floyd, The Who, Queen, AC/DC, Black Sabbath, Nirvana, Pearl Jam, U2, and dozens of other essential acts. Expect album release years, lead singers, famous tracks, iconic guitarists, and pivotal moments.

You have 15 seconds per question. A correct answer is worth 100 base points plus 10 points for every second left on the clock — so know it cold and be quick to maximize your tally. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is revealed before you continue. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you grew up with vinyl or discovered classics on streaming, this quiz will rock you!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RockMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: RockMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:RockMusicQuizGame,
};
