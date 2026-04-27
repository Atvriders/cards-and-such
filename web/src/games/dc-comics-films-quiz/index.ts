import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DcComicsFilmsQuizState, DcComicsFilmsQuizAction, DcComicsFilmsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DcComicsFilmsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dcComicsFilmsQuizPlugin: GamePlugin<DcComicsFilmsQuizState, DcComicsFilmsQuizAction, typeof settings> = {
  id:"dc-comics-films-quiz", title:"DC Comics Films Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Batman, Superman, Wonder Woman, and the wider DC universe.",
  howToPlay:`DC Comics Films Quiz tests your knowledge of the heroes, villains, and films of the DC universe. From the Caped Crusader's many cinematic incarnations to Superman, Wonder Woman, Aquaman, the Flash, and the Justice League, you'll be quizzed on actors, directors, secret identities, hometowns, and iconic story moments.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Time to suit up — to the Batcave!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DcComicsFilmsQuizSettings),
  reducer,isTerminal,component:DcComicsFilmsQuizGame,
};
