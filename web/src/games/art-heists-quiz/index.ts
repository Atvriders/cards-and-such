import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArtHeistsQuizState, ArtHeistsQuizAction, ArtHeistsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArtHeistsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const artHeistsQuizPlugin: GamePlugin<ArtHeistsQuizState, ArtHeistsQuizAction, typeof settings> = {
  id:"art-heists-quiz", title:"Famous Art Heists Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of famous art heists in history.",
  howToPlay:"Famous Art Heists Quiz tests your knowledge of the boldest, strangest, and most expensive art thefts in history. From the 1911 theft of the Mona Lisa from the Louvre, to the 1990 Isabella Stewart Gardner Museum heist still unsolved, to the 2010 Paris Modern Art Museum job — art crime sits at a strange intersection of cultural loss and noir intrigue.\n\nQuestions cover famous stolen paintings (Vermeer, Rembrandt, Munch, Picasso), the locations and methods of major thefts, recovered works, ongoing missing pieces, and the criminals — opportunists, sophisticated rings, and Stéphane Breitwieser-style obsessive collectors — behind them.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ArtHeistsQuizSettings),
  reducer,isTerminal,
  hint: (state: ArtHeistsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ArtHeistsQuizGame,
};
