import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CountryMusicQuizState, CountryMusicQuizAction, CountryMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountryMusicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const countryMusicQuizPlugin: GamePlugin<CountryMusicQuizState, CountryMusicQuizAction, typeof settings> = {
  id:"country-music-quiz", title:"Country Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Country and Nashville: Cash, Williams, Strait, Dolly, and the modern stars.",
  howToPlay:`Country Music Quiz takes you through the heart of country, from the Carter Family and Hank Williams to Johnny Cash, George Strait, Dolly Parton, Garth Brooks, Shania Twain, and today's Nashville superstars. Expect questions on iconic singles, breakthrough albums, the Grand Ole Opry, the CMA awards, and the songwriters who built the genre.

You have 15 seconds per question. Each correct answer earns 100 base points plus 10 per second remaining on the clock. Wrong answers earn nothing.

Tap a choice and press Submit. Correct choices glow green; wrong choices turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Whether you ride for Bakersfield, bro country, or anything in between, this quiz will show you what you really know about country!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CountryMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: CountryMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CountryMusicQuizGame,
};
