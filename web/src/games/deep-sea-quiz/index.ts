import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeepSeaQuizState, DeepSeaQuizAction, DeepSeaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeepSeaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const deepSeaQuizPlugin: GamePlugin<DeepSeaQuizState, DeepSeaQuizAction, typeof settings> = {
  id:"deep-sea-quiz", title:"Deep Sea Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of deep-sea exploration.",
  howToPlay:"Deep Sea Quiz tests your knowledge of humanity's exploration of Earth's last frontier. Questions cover the Mariana Trench, the Challenger Deep, James Cameron's solo dive, the bathyscaphe Trieste, hydrothermal vents and tubeworms, and famous shipwrecks discovered by Robert Ballard. You'll be asked about the Hadalpelagic zone, ROVs and AUVs, bioluminescence, pressure at depth, and the giant squid.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DeepSeaQuizSettings),
  reducer,isTerminal,
  hint: (state: DeepSeaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DeepSeaQuizGame,
};
