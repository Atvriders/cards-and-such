import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CountryFlagQuizState, CountryFlagQuizAction, CountryFlagQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountryFlagQuiz } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const countryFlagQuizPlugin: GamePlugin<CountryFlagQuizState, CountryFlagQuizAction, typeof settings> = {
  id:"country-flag-quiz", title:"Country Flag Quiz", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"How well do you know the world's flags? Colors, symbols, and shapes from every continent!",
  howToPlay:`Country Flag Quiz tests your knowledge of the distinctive colors, shapes, and symbols that make up the flags of nations around the world. From the maple leaf of Canada to the dragon of Bhutan, every flag tells a story.

Select one of four choices and press Submit. Each correct answer earns 100 points. After submitting, the correct answer is revealed so you can learn from any mistakes.

Questions cover flag colors and arrangements, unique symbols (animals, plants, celestial objects), geometric shapes, and interesting flag facts such as Nepal's non-rectangular shape or Switzerland's square proportions.

Regions covered include Europe, the Americas, Asia, Africa, and Oceania — giving you a global tour through vexillology (the study of flags). Use Settings to choose 10 or 20 questions. Questions are randomly selected and answer choices are shuffled each game. Whether you are a geography enthusiast or just love colorful symbols, this quiz will expand your knowledge of the world's nations!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CountryFlagQuizSettings),
  reducer, isTerminal, 
  hint: (state: CountryFlagQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CountryFlagQuiz,
};
