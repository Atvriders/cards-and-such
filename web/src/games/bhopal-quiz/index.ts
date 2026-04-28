import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BhopalQuizState, BhopalQuizAction, BhopalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BhopalQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bhopalQuizPlugin: GamePlugin<BhopalQuizState, BhopalQuizAction, typeof settings> = {
  id:"bhopal-quiz", title:"Bhopal Disaster Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1984 Bhopal industrial gas disaster.",
  howToPlay:"Bhopal Disaster Quiz tests your knowledge of the world's worst industrial accident. Questions cover the December 1984 toxic gas leak from the Union Carbide plant, the deadly methyl isocyanate release, the immediate human toll on the city of Bhopal, and the long, troubled legal aftermath. You'll be asked about the Indian government response, the company's CEO Warren Anderson, the contaminated site, and the ongoing health effects on survivors and their children.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BhopalQuizSettings),
  reducer,isTerminal,component:BhopalQuizGame,
};
