import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheeseQuizState, CheeseQuizAction, CheeseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheeseQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cheeseQuizPlugin: GamePlugin<CheeseQuizState, CheeseQuizAction, typeof settings> = {
  id:"cheese-quiz", title:"Cheese Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Age into a board of thirty cheese varieties, regions, and aging traditions.",
  howToPlay:"Cheese Quiz tests your knowledge of the world's most diverse fermented food. Questions cover the major families: hard aged cheeses (Parmigiano-Reggiano, Pecorino, Manchego, aged cheddar), soft-ripened (Brie, Camembert, Brillat-Savarin), washed-rind (Epoisses, Limburger, Taleggio), blues (Roquefort, Stilton, Gorgonzola), and stretched-curd (mozzarella, provolone, halloumi). You'll see questions on regional origins, milk types — cow, goat, sheep, water buffalo — and aging timelines that range from days to years.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice, press Submit, and see how you fared. Correct answers light up green; wrong choices turn red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you build cheese boards for a living or just love an extra-sharp cheddar, this quiz brings a wedge of dairy knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CheeseQuizSettings),
  reducer,isTerminal,
  hint: (state: CheeseQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CheeseQuizGame,
};
