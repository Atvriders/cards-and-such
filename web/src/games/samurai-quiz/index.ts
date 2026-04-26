import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SamuraiQuizState, SamuraiQuizAction, SamuraiQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SamuraiQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const samuraiQuizPlugin: GamePlugin<SamuraiQuizState, SamuraiQuizAction, typeof settings> = {
  id:"samurai-quiz", title:"Samurai Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of samurai culture, Bushido, Japanese feudalism, and swordsmanship.",
  howToPlay:`Samurai Quiz challenges your knowledge of feudal Japan's warrior class. Questions cover the Bushido code, famous weapons like the katana and wakizashi, the shogunate system, legendary figures like Miyamoto Musashi and Tokugawa Ieyasu, Zen Buddhism, Japanese armor, and the end of the samurai era.

Each question has four choices. Pick the correct answer to earn 10 points. The right answer reveals in green; wrong guesses turn red.

Press Next to advance. Choose 5, 10, or 15 questions in Settings.

Key facts: Bushido means "way of the warrior"; seppuku was ritual suicide; ronin were masterless samurai; the Meiji Restoration of 1868 ended the samurai class; Miyamoto Musashi wrote the Book of Five Rings; the kabuto was the samurai helmet. Master these facts to achieve a perfect score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SamuraiQuizSettings),
  reducer,isTerminal,component:SamuraiQuizGame,
};
