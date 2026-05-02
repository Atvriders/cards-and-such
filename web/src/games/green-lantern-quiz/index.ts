import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GreenLanternQuizState, GreenLanternQuizAction, GreenLanternQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GreenLanternQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const greenLanternQuizPlugin: GamePlugin<GreenLanternQuizState, GreenLanternQuizAction, typeof settings> = {
  id:"green-lantern-quiz", title:"Green Lantern Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Green Lantern lore: power rings, Oa, the Corps, and the emotional spectrum.",
  howToPlay:`Green Lantern Quiz tests your knowledge of DC Comics' intergalactic peacekeepers. Questions cover Hal Jordan, John Stewart, Guy Gardner, Kyle Rayner, Jessica Cruz, the Guardians of the Universe on Oa, the 3600 sectors of space, the Manhunters, the Sinestro Corps, the emotional spectrum (Green willpower, Yellow fear, Red rage, Orange greed, Blue hope, Indigo compassion, Violet love, Black death, White life), and Blackest Night.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. In brightest day, in blackest night, no quiz shall escape your sight!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GreenLanternQuizSettings),
  reducer,isTerminal,
  hint: (state: GreenLanternQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GreenLanternQuizGame,
};
