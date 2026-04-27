import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SiliconValleyQuizState, SiliconValleyQuizAction, SiliconValleyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SiliconValleyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const siliconValleyQuizPlugin: GamePlugin<SiliconValleyQuizState, SiliconValleyQuizAction, typeof settings> = {
  id:"silicon-valley-quiz", title:"Silicon Valley Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Silicon Valley founders, companies, and startups.",
  howToPlay:"Silicon Valley Quiz challenges you on the people, companies, and culture of the world's tech hub: Hewlett and Packard's garage, the rise of Intel and Apple, Steve Jobs and Bill Gates, the dot-com era, the social-media boom, and modern giants like Google, Facebook, Tesla, and Nvidia. Test your knowledge of founders, IPOs, famous quotes, and the geography of the Valley.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you work in tech, follow startups, or watched the HBO show, this quiz will revisit the legends and lore of Silicon Valley!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SiliconValleyQuizSettings),
  reducer,isTerminal,component:SiliconValleyQuizGame,
};
