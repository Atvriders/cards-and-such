import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeologyQuizState, GeologyQuizAction, GeologyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GeologyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const geologyQuizPlugin: GamePlugin<GeologyQuizState, GeologyQuizAction, typeof settings> = {
  id:"geology-quiz", title:"Geology Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of rocks, plate tectonics, and fossils.",
  howToPlay:"Geology Quiz challenges you on the science of the Earth: rocks and minerals, plate tectonics, volcanoes, earthquakes, fossils, and the deep history of our planet. Questions span everything from the Mohs hardness scale to continental drift and from major extinction events to the formation of the Grand Canyon.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you collect rocks, hunt fossils, or just love mountains and volcanoes, this quiz will deepen your understanding of the dynamic Earth beneath your feet!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GeologyQuizSettings),
  reducer,isTerminal,
  hint: (state: GeologyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GeologyQuizGame,
};
