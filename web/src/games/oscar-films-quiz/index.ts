import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OscarFilmsQuizState, OscarFilmsQuizAction, OscarFilmsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OscarFilmsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oscarFilmsQuizPlugin: GamePlugin<OscarFilmsQuizState, OscarFilmsQuizAction, typeof settings> = {
  id:"oscar-films-quiz", title:"Oscar-Winning Films Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Best Picture winners and Academy Award classics.",
  howToPlay:`Oscar-Winning Films Quiz puts your knowledge of Hollywood's biggest night to the test. Questions span every era of the Academy Awards, from Golden Age classics like 'Casablanca' and 'Gone with the Wind' to recent winners like 'Parasite', 'CODA', and 'Oppenheimer'. You'll be quizzed on Best Picture winners, legendary directors, the actors who took home Best Actor and Best Actress, and the stories behind iconic ceremonies.

You have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Whether you're a casual moviegoer or a dedicated cinephile, lights, camera, action!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OscarFilmsQuizSettings),
  reducer,isTerminal,component:OscarFilmsQuizGame,
};
