import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaveExploreQuizState, CaveExploreQuizAction, CaveExploreQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CaveExploreQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const caveExploreQuizPlugin: GamePlugin<CaveExploreQuizState, CaveExploreQuizAction, typeof settings> = {
  id:"cave-explore-quiz", title:"Cave Exploration Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of caves, caving, and famous spelunking expeditions.",
  howToPlay:"Cave Exploration Quiz tests your knowledge of underground worlds. Questions cover the longest and deepest caves on Earth, famous explorations like the Mammoth Cave system, the discovery of the Lascaux paintings, and tragic incidents like the Tham Luang cave rescue. You'll be asked about stalactites versus stalagmites, karst topography, gypsum caves, glow worms, and the equipment used by modern speleologists.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaveExploreQuizSettings),
  reducer,isTerminal,
  hint: (state: CaveExploreQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CaveExploreQuizGame,
};
