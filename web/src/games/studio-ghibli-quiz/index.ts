import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StudioGhibliQuizState, StudioGhibliQuizAction, StudioGhibliQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StudioGhibliQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const studioGhibliQuizPlugin: GamePlugin<StudioGhibliQuizState, StudioGhibliQuizAction, typeof settings> = {
  id:"studio-ghibli-quiz", title:"Studio Ghibli Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Studio Ghibli knowledge: Miyazaki's films, characters, settings, and unforgettable moments.",
  howToPlay:`Studio Ghibli Quiz tests your knowledge of Japan's most beloved animation studio. Questions cover Hayao Miyazaki's masterpieces — Spirited Away, My Neighbor Totoro, Princess Mononoke, Howl's Moving Castle, Castle in the Sky, Kiki's Delivery Service — plus Isao Takahata's haunting works like Grave of the Fireflies and The Tale of the Princess Kaguya, and the studio's lesser-known gems.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Whether you grew up watching Totoro or only recently discovered Mononoke, this quiz celebrates Ghibli's enduring magic.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StudioGhibliQuizSettings),
  reducer,isTerminal,
  hint: (state: StudioGhibliQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StudioGhibliQuizGame,
};
