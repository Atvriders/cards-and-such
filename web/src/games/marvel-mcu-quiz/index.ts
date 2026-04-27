import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelMcuQuizState, MarvelMcuQuizAction, MarvelMcuQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarvelMcuQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const marvelMcuQuizPlugin: GamePlugin<MarvelMcuQuizState, MarvelMcuQuizAction, typeof settings> = {
  id:"marvel-mcu-quiz", title:"Marvel MCU Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Marvel Cinematic Universe — heroes, villains, and lore.",
  howToPlay:`Marvel MCU Quiz puts your knowledge of the Marvel Cinematic Universe to the test. Questions span every Phase from the original Iron Man (2008) through the Multiverse Saga, covering Avengers, Guardians of the Galaxy, Black Panther, Thor, Doctor Strange, Spider-Man, the Eternals, and the Disney+ TV series. Expect questions on heroes, villains, Infinity Stones, Wakanda, Asgard, and the actors who brought these characters to life.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Avengers Assemble!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MarvelMcuQuizSettings),
  reducer,isTerminal,component:MarvelMcuQuizGame,
};
