import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EverestQuizState, EverestQuizAction, EverestQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EverestQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const everestQuizPlugin: GamePlugin<EverestQuizState, EverestQuizAction, typeof settings> = {
  id:"everest-quiz", title:"Mt. Everest Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Mt. Everest climbing history and challenges.",
  howToPlay:"Mt. Everest Quiz tests your knowledge of the world's highest peak. Questions cover its measurement, the first successful summit by Edmund Hillary and Tenzing Norgay in 1953, the Death Zone, the Khumbu Icefall, and infamous tragedies like the 1996 disaster. You'll be asked about base camps, oxygen use, the Sherpa community, route choices (South Col vs. North Ridge), and notable climbers like George Mallory.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EverestQuizSettings),
  reducer,isTerminal,component:EverestQuizGame,
};
