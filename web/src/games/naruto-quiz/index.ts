import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NarutoQuizState, NarutoQuizAction, NarutoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NarutoQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const narutoQuizPlugin: GamePlugin<NarutoQuizState, NarutoQuizAction, typeof settings> = {
  id:"naruto-quiz", title:"Naruto Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Naruto lore: ninja techniques, clans, villages, and the Hidden Leaf's heroes.",
  howToPlay:`Naruto Quiz tests your knowledge of Masashi Kishimoto's beloved ninja saga. Questions cover the original Naruto and Naruto Shippuden — characters from Team 7, the Akatsuki, the Five Great Shinobi Villages, the Tailed Beasts, the Sage of the Six Paths, and the legendary Hokages, all the way through the Fourth Great Ninja War.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Whether you're a die-hard Sasuke fan or a Rock Lee taijutsu loyalist, see how deep your shinobi knowledge runs. Believe it!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NarutoQuizSettings),
  reducer,isTerminal,component:NarutoQuizGame,
};
