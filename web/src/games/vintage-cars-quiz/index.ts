import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VintageCarsQuizState, VintageCarsQuizAction, VintageCarsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VintageCarsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const vintageCarsQuizPlugin: GamePlugin<VintageCarsQuizState, VintageCarsQuizAction, typeof settings> = {
  id:"vintage-cars-quiz", title:"Vintage Cars Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of classic and vintage automobiles.",
  howToPlay:"Vintage Cars Quiz tests your knowledge of classic automobiles from the early 20th century through the 1970s. Questions range over iconic marques like Ford, Packard, Cadillac, Bugatti, Duesenberg, Bentley, and Rolls-Royce, plus the eras and technologies that defined them — from the brass era and Model T mass production to the post-war chrome dreams and muscle's golden years.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a concours regular or a casual gear-head, Vintage Cars Quiz will rev your engine!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VintageCarsQuizSettings),
  reducer,isTerminal,
  hint: (state: VintageCarsQuizState): HintTarget | null => {
    if (state.phase !== "playing") return null;
    return { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 };
  },
  component:VintageCarsQuizGame,
};
