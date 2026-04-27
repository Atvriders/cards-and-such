import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JapanCultureQuizState, JapanCultureQuizAction, JapanCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JapanCultureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const japanCultureQuizPlugin: GamePlugin<JapanCultureQuizState, JapanCultureQuizAction, typeof settings> = {
  id:"japan-culture-quiz", title:"Japan Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Japanese culture: anime, food, history, and language.",
  howToPlay:"Japan Culture Quiz tests your knowledge of all things Japanese — from anime icons like Studio Ghibli and One Piece to staple cuisine such as sushi, ramen, tempura, and miso. Questions cover the Tokugawa shogunate, the Meiji Restoration, the samurai era, and modern post-war Japan. You'll also encounter language fundamentals: hiragana, katakana, kanji, plus polite expressions and pop-culture vocabulary.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining, so quick reflexes pay handsomely. Wrong answers earn nothing, but the right answer is always shown so you learn as you play.\n\nTap a choice, then press Submit. Correct answers glow green; wrong ones turn red. Press Next to move on to the next question.\n\nChoose 10 or 20 questions in Settings. Whether you're an anime enthusiast, a sushi lover, or a history buff fascinated by the rise of the Land of the Rising Sun, this quiz will test how much you really know!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JapanCultureQuizSettings),
  reducer,isTerminal,component:JapanCultureQuizGame,
};
