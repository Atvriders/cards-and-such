import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicCharadesQuizState, ClassicCharadesQuizAction, ClassicCharadesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClassicCharadesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const classicCharadesQuizPlugin: GamePlugin<ClassicCharadesQuizState, ClassicCharadesQuizAction, typeof settings> = {
  id:"classic-charades-quiz", title:"Classic Charades Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the centuries-old miming party game played at countless gatherings.",
  howToPlay:"Classic Charades Trivia tests your knowledge of the world's most famous silent-acting party game, played for centuries at family gatherings and theatre warm-ups alike. Questions cover the standard gestures, the categories, the rule against speaking, and the scoring conventions — all without ever needing to mime an aardvark yourself. Ten questions appear in total. Choose your answer and tap Submit. Correct picks score 100 base points plus 10 points per second left on the 15-second clock — fast players score more. Wrong answers reveal the correct choice and disable further selection, after which Next advances the round. The game ends with question ten and shows your final score. Whether you grew up acting out 'movie title — three syllables' in your living room or you wonder why someone would tug their ear at you, this quiz separates the seasoned mimes from the curious newcomers.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClassicCharadesQuizSettings),
  reducer,isTerminal,
  hint: (state: ClassicCharadesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ClassicCharadesQuizGame,
};
