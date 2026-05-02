import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PizzaQuizState, PizzaQuizAction, PizzaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PizzaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pizzaQuizPlugin: GamePlugin<PizzaQuizState, PizzaQuizAction, typeof settings> = {
  id:"pizza-quiz", title:"Pizza Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Slice into pizza history, regional styles, and ingredients across thirty topping-loaded questions.",
  howToPlay:`Pizza Quiz tests your knowledge of the world's most beloved flatbread. Questions cover Italian regional styles — Neapolitan, Roman, Sicilian, Pinsa, al taglio — alongside American innovations like New York thin crust, Chicago deep dish, Detroit pan, St. Louis with Provel, and California gourmet pizzas. You'll also see questions on famous toppings, signature cheeses, traditional dough techniques, the AVPN certification, and oven temperatures that approach 900 degrees Fahrenheit.

Each question gives you 15 seconds to answer. Correct answers award 100 base points plus 10 points for every second left on the clock. Wrong answers earn nothing.

Tap a choice, press Submit, and see how you fared. Correct answers light up green; wrong choices flash red and reveal the right answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you prefer Margherita simplicity or pineapple controversy, this quiz delivers a full slice of pizza trivia.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PizzaQuizSettings),
  reducer,isTerminal,
  hint: (state: PizzaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PizzaQuizGame,
};
