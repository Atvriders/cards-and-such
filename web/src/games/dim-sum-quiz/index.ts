import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DimSumQuizState, DimSumQuizAction, DimSumQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DimSumQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dimSumQuizPlugin: GamePlugin<DimSumQuizState, DimSumQuizAction, typeof settings> = {
  id:"dim-sum-quiz", title:"Dim Sum Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Push the cart through har gow, siu mai, and Cantonese tea-house favorites in thirty bite-sized questions.",
  howToPlay:"Dim Sum Quiz tests your knowledge of Cantonese tea-house cuisine. Questions cover the classic dumplings — har gow (shrimp), siu mai (open-top pork-shrimp), char siu bao (BBQ pork buns), xiao long bao (soup dumplings, originally Shanghai), and cheong fun (rice noodle rolls). You'll see questions on bamboo steamers, the tradition of yum cha, common ingredients like lotus leaf, taro, and turnip cake, and the small plates of fried delights that complete a Sunday morning brunch.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers light up green; wrong choices flash red and reveal the answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you push the cart in Hong Kong every weekend or just discovered har gow last month, this quiz delivers a steamer-basket full of tea-house knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DimSumQuizSettings),
  reducer,isTerminal,
  hint: (state: DimSumQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DimSumQuizGame,
};
