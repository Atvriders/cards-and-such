import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MtStHelensQuizState, MtStHelensQuizAction, MtStHelensQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MtStHelensQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mtStHelensQuizPlugin: GamePlugin<MtStHelensQuizState, MtStHelensQuizAction, typeof settings> = {
  id:"mt-st-helens-quiz", title:"Mt. St. Helens Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1980 eruption of Mount St. Helens.",
  howToPlay:"Mt. St. Helens Quiz tests your knowledge of the famous 1980 volcanic eruption in Washington State. Questions cover the catastrophic lateral blast, the death of volcanologist David Johnston, the iconic story of Harry R. Truman, the massive landslide, and the lasting impact on the Cascade Range. You'll be asked about VEI scale, ash dispersion across the U.S., the bulging cryptodome, and the volcano's continued activity.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MtStHelensQuizSettings),
  reducer,isTerminal,component:MtStHelensQuizGame,
};
