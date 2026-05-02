import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BreadQuizState, BreadQuizAction, BreadQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BreadQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const breadQuizPlugin: GamePlugin<BreadQuizState, BreadQuizAction, typeof settings> = {
  id:"bread-quiz", title:"Bread Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Knead through sourdough, baguette, pita, naan, and beloved breads worldwide in thirty crusty questions.",
  howToPlay:"Bread Quiz tests your knowledge of the world's most universal staple. Questions cover the major leavened breads — French baguette and pain de campagne, Italian ciabatta and focaccia, German pumpernickel and rye, sourdough culture, English muffins and crumpets — and the unleavened or yeast-light flatbreads that span continents: Mexican tortilla, Indian naan and chapati, Middle Eastern pita and lavash, Ethiopian injera, Jewish challah and matzo. You'll see questions on grain types, hydration percentages, fermentation, and famous regional bakers.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice, press Submit. Correct answers light up green; wrong ones turn red and show the answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you bake sourdough every weekend or you just love a hot baguette, this quiz delivers a fresh-baked loaf of bread knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BreadQuizSettings),
  reducer,isTerminal,
  hint: (state: BreadQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BreadQuizGame,
};
