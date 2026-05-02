import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JazzQuizState, JazzQuizAction, JazzQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JazzQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const jazzQuizPlugin: GamePlugin<JazzQuizState, JazzQuizAction, typeof settings> = {
  id:"jazz-quiz", title:"Jazz Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of jazz: bebop, swing, fusion, and the legends who made them.",
  howToPlay:`Jazz Music Quiz tests your knowledge of America's greatest art form. Questions cover the giants of jazz — Louis Armstrong, Duke Ellington, Charlie Parker, Miles Davis, John Coltrane, and many more — along with the styles and eras they shaped: New Orleans Dixieland, the Swing era, bebop, cool jazz, hard bop, modal, free jazz, fusion, and beyond.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you're a hardcore Blue Note collector or just someone who loves a good groove, Jazz Music Quiz will swing!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JazzQuizSettings),
  reducer,isTerminal,
  hint: (state: JazzQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:JazzQuizGame,
};
