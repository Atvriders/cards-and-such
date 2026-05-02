import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentyTensQuizState, TwentyTensQuizAction, TwentyTensQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyTensQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const twentyTensQuizPlugin: GamePlugin<TwentyTensQuizState, TwentyTensQuizAction, typeof settings> = {
  id:"2010s-quiz", title:"2010s Social Media Era Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Instagram, streaming, Marvel, and Trump — the 2010s.",
  howToPlay:`2010s Social Media Era Quiz covers the rise of Instagram and TikTok, Netflix's streaming dominance, the Marvel Cinematic Universe, K-pop, climate activism, Brexit, the Trump presidency, and viral memes. A decade defined by smartphones and global connectivity.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwentyTensQuizSettings),
  reducer,isTerminal,
  hint: (state: TwentyTensQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TwentyTensQuizGame,
};
