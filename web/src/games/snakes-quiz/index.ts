import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnakesQuizState, SnakesQuizAction, SnakesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnakesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const snakesQuizPlugin: GamePlugin<SnakesQuizState, SnakesQuizAction, typeof settings> = {
  id:"snakes-quiz", title:"Snakes Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's serpents.",
  howToPlay:"Snakes Quiz tests your knowledge of the world's most fascinating reptiles. Questions cover venomous and non-venomous species, habitats, hunting strategies, the longest and most dangerous snakes, snake anatomy and reproduction, and famous species like cobras, vipers, pythons, and the deadly black mamba.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you're a herpetologist, a snake handler, or just have a healthy curiosity about these mysterious creatures, this quiz will test your venom-vs-non-venom knowledge. Slither in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SnakesQuizSettings),
  reducer,isTerminal,
  hint: (state: SnakesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SnakesQuizGame,
};
