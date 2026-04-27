import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BiologyQuizState, BiologyQuizAction, BiologyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BiologyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const biologyQuizPlugin: GamePlugin<BiologyQuizState, BiologyQuizAction, typeof settings> = {
  id:"biology-quiz", title:"Biology Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of cells, evolution, and ecosystems.",
  howToPlay:"Biology Quiz challenges you on the science of life: cell biology, genetics and DNA, the theory of evolution, ecosystems, and the great biologists who shaped our understanding. Questions cover organelles, mitosis and meiosis, Darwin and natural selection, food webs, and much more.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're studying for a biology exam or just love learning about the living world, this quiz will sharpen your knowledge from the cellular level to whole ecosystems!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BiologyQuizSettings),
  reducer,isTerminal,component:BiologyQuizGame,
};
