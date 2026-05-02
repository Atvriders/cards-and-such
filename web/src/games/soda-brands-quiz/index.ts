import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SodaBrandsQuizState, SodaBrandsQuizAction, SodaBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SodaBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sodaBrandsQuizPlugin: GamePlugin<SodaBrandsQuizState, SodaBrandsQuizAction, typeof settings> = {
  id:"soda-brands-quiz", title:"Soda Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Coke, Pepsi and the fizzy brands you grew up drinking.",
  howToPlay:"Soda Brands Quiz tests your knowledge of the world's favorite soft drinks. Questions cover Coca-Cola, Pepsi, Dr Pepper, Fanta, 7-Up, Mountain Dew and many regional sodas — including their origins, slogans, signature flavors, mascots, and the marketing wars that defined the cola century.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Pop the cap on this one and see how many fizzy facts you can recall before the bubbles go flat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SodaBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: SodaBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SodaBrandsQuizGame,
};
