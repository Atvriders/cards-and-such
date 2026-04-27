import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SciFiFilmsQuizState, SciFiFilmsQuizAction, SciFiFilmsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SciFiFilmsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sciFiFilmsQuizPlugin: GamePlugin<SciFiFilmsQuizState, SciFiFilmsQuizAction, typeof settings> = {
  id:"sci-fi-films-quiz", title:"Sci-Fi Films Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of science fiction cinema — from Star Wars to Blade Runner.",
  howToPlay:`Sci-Fi Films Quiz tests your knowledge of science fiction cinema. From the galaxy-spanning saga of 'Star Wars' to the rain-soaked streets of 'Blade Runner', the existential trips of '2001: A Space Odyssey' and 'Solaris', through to modern epics like 'Interstellar', 'Arrival', and 'Dune', you'll be quizzed on directors, characters, technology, and iconic moments. Expect Skynet, the Matrix, lightsabers, replicants, HAL 9000, and time travel.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Engage!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SciFiFilmsQuizSettings),
  reducer,isTerminal,component:SciFiFilmsQuizGame,
};
