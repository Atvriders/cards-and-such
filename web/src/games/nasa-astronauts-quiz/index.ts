import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NasaAstronautsQuizState, NasaAstronautsQuizAction, NasaAstronautsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NasaAstronautsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nasaAstronautsQuizPlugin: GamePlugin<NasaAstronautsQuizState, NasaAstronautsQuizAction, typeof settings> = {
  id:"nasa-astronauts-quiz", title:"NASA Astronauts Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"The spacefarers who walked on the Moon, flew the Shuttle and beyond.",
  howToPlay:"NASA Astronauts Quiz tests your knowledge of America's spacefarers. Questions cover Mercury, Gemini, Apollo, Skylab, Space Shuttle and ISS missions — naming first-flight pioneers, Moonwalkers, Shuttle commanders, mission patches, training centers, and the famous quotes spoken from orbit and the lunar surface.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Houston, we have a quiz — see if you have the right stuff!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NasaAstronautsQuizSettings),
  reducer,isTerminal,component:NasaAstronautsQuizGame,
};
