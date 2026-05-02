import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TechBrandsQuizState, TechBrandsQuizAction, TechBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TechBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const techBrandsQuizPlugin: GamePlugin<TechBrandsQuizState, TechBrandsQuizAction, typeof settings> = {
  id:"tech-brands-quiz", title:"Tech Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Apple, Google, Microsoft and the founders who built tech giants.",
  howToPlay:"Tech Brands Quiz tests your knowledge of the world's leading technology companies. Questions span founders and CEOs, founding years, headquarters, signature products, slogans, and the pivotal moments that shaped Silicon Valley and the global tech industry — from Apple's garage origins to the dot-com boom and the modern cloud era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Test yourself on Apple, Google, Microsoft, Amazon, Meta, IBM and dozens of others — see if your tech knowledge is firmware-deep!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TechBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: TechBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TechBrandsQuizGame,
};
