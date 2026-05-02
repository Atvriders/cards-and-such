import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ModernArtQuizState, ModernArtQuizAction, ModernArtQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ModernArtQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const modernArtQuizPlugin: GamePlugin<ModernArtQuizState, ModernArtQuizAction, typeof settings> = {
  id:"modern-art-quiz", title:"Modern Art Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of modern and contemporary art movements, artists, and iconic works.",
  howToPlay:`Modern Art Quiz challenges your knowledge of art from the late 19th century to today. Questions cover famous artists like Picasso, Warhol, Dalí, and Basquiat; movements such as Cubism, Surrealism, Pop Art, and Abstract Expressionism; groundbreaking artworks and their creators; and the galleries and institutions that shaped modern art history.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining on the clock. Answer quickly for maximum points.

Click a choice to highlight it, then press Submit. After submitting, the correct answer lights up green and wrong answers turn red. Press Next to continue to the following question.

Choose 10, 20, or 30 questions in Settings. Questions range from accessible pop art trivia to deeper conceptual art knowledge. Whether you visit galleries or just appreciate a great print, Modern Art Quiz will sharpen your eye!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ModernArtQuizSettings),
  reducer,isTerminal,
  hint: (state: ModernArtQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ModernArtQuizGame,
};
