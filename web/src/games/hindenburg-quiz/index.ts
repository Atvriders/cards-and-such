import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HindenburgQuizState, HindenburgQuizAction, HindenburgQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HindenburgQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hindenburgQuizPlugin: GamePlugin<HindenburgQuizState, HindenburgQuizAction, typeof settings> = {
  id:"hindenburg-quiz", title:"Hindenburg Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Hindenburg airship disaster of 1937.",
  howToPlay:"Hindenburg Quiz tests your knowledge of the famous airship disaster. Questions cover the construction of the LZ 129 Hindenburg, its passenger service across the Atlantic, the fiery crash at Lakehurst Naval Air Station on May 6, 1937, and the still-debated cause. You'll be asked about Captain Max Pruss, broadcaster Herbert Morrison's famous radio report, the use of hydrogen versus helium, and the impact on commercial airship travel.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HindenburgQuizSettings),
  reducer,isTerminal,
  hint: (state: HindenburgQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HindenburgQuizGame,
};
