import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComicVillainsQuizState, ComicVillainsQuizAction, ComicVillainsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ComicVillainsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const comicVillainsQuizPlugin: GamePlugin<ComicVillainsQuizState, ComicVillainsQuizAction, typeof settings> = {
  id:"comic-villains-quiz", title:"Comic Book Villains Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the greatest super-villains across DC, Marvel, and beyond.",
  howToPlay:`Comic Book Villains Quiz tests your knowledge of the greatest baddies across all comics — from DC's most despicable (Joker, Lex Luthor, Darkseid, Black Adam) to Marvel's most menacing (Thanos, Magneto, Doctor Doom, Galactus, Loki). Questions cover origins, signature crimes, secret identities, weapons, weaknesses, and the heroes who oppose them across decades of superhero storytelling.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. The world's villains await — see if you can name them all without losing your soul.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ComicVillainsQuizSettings),
  reducer,isTerminal,component:ComicVillainsQuizGame,
};
