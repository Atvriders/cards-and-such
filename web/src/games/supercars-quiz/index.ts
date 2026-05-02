import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SupercarsQuizState, SupercarsQuizAction, SupercarsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SupercarsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const supercarsQuizPlugin: GamePlugin<SupercarsQuizState, SupercarsQuizAction, typeof settings> = {
  id:"supercars-quiz", title:"Supercars Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Ferraris, Lamborghinis, McLarens — test your supercar knowledge.",
  howToPlay:"Supercars Quiz challenges your knowledge of the world's most exotic, fastest, and most beautiful machines. From Ferrari and Lamborghini to McLaren, Bugatti, Pagani, Koenigsegg, and Porsche, this quiz covers the icons that define automotive obsession and the modern hypercars pushing every boundary of speed, technology, and price.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a poster collector or a track-day junkie, this quiz will separate the dreamers from the experts!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SupercarsQuizSettings),
  reducer,isTerminal,
  hint: (state: SupercarsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SupercarsQuizGame,
};
