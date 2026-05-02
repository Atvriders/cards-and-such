import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiQuizState, SushiQuizAction, SushiQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sushiQuizPlugin: GamePlugin<SushiQuizState, SushiQuizAction, typeof settings> = {
  id:"sushi-quiz", title:"Sushi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll into sushi knowledge with thirty bite-sized questions on nigiri, sashimi, makimono, and more.",
  howToPlay:"Sushi Quiz tests your knowledge of Japan's most iconic cuisine. Questions cover the major sushi forms — nigiri (hand-pressed rice topped with fish), sashimi (sliced fish without rice), maki (rolled), uramaki (inside-out rolls), temaki (hand rolls), and chirashi (scattered bowls). You'll see questions on common fish species like maguro, sake, hamachi, and unagi, classic toppings, traditional knives, and the role of wasabi, gari, and shari rice.\n\nEach question gives you 15 seconds. Correct answers award 100 base points plus 10 points for every second left on the clock — quick fingers earn the biggest score. Wrong answers earn nothing.\n\nSelect a choice, then press Submit. Correct answers glow green; wrong choices turn red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you're an omakase veteran or just love supermarket California rolls, this quiz delivers a satisfying taste of sushi knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SushiQuizSettings),
  reducer,isTerminal,
  hint: (state: SushiQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SushiQuizGame,
};
