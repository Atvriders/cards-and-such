import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RenaissanceQuizState, RenaissanceQuizAction, RenaissanceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RenaissanceQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const renaissanceQuizPlugin: GamePlugin<RenaissanceQuizState, RenaissanceQuizAction, typeof settings> = {
  id:"renaissance-quiz", title:"Renaissance Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Renaissance — art, science, exploration, and the great thinkers.",
  howToPlay:`Renaissance Quiz tests your knowledge of Europe's great cultural rebirth spanning the 14th to 17th centuries. Questions cover famous artists like Leonardo da Vinci, Michelangelo, and Raphael; thinkers like Machiavelli and Erasmus; scientific pioneers like Copernicus; explorers like Columbus and Magellan; and patron families like the Medici.

Each question offers four choices. Pick the correct one to earn 10 points. Green means right; red means wrong.

Press Next to continue. Choose 5, 10, or 15 questions in Settings.

Key facts: The Renaissance began in Italy; Leonardo painted the Mona Lisa and The Last Supper; Michelangelo painted the Sistine Chapel; Gutenberg invented the printing press; the Medici were the key patrons in Florence; Copernicus proposed the heliocentric model; Columbus reached the Americas in 1492. Learn these and achieve a perfect score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RenaissanceQuizSettings),
  reducer,isTerminal,
  hint: (state: RenaissanceQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:RenaissanceQuizGame,
};
