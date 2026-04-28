import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SurvivalQuizState, SurvivalQuizAction, SurvivalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SurvivalQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const survivalQuizPlugin: GamePlugin<SurvivalQuizState, SurvivalQuizAction, typeof settings> = {
  id:"survival-quiz", title:"Survival Skills Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of wilderness survival skills.",
  howToPlay:"Survival Skills Quiz tests your knowledge of staying alive in the wild. Questions cover the Rule of Threes (air, shelter, water, food), fire-starting techniques like bow drill and ferro rod, edible vs. poisonous plants, navigation by the stars, water purification, hypothermia and heat stroke, and signaling for rescue. You'll be asked about famous survival stories, Bear Grylls, knot tying, animal tracking, and the priorities that keep you alive when things go wrong.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SurvivalQuizSettings),
  reducer,isTerminal,component:SurvivalQuizGame,
};
