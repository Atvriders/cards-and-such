import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChinaHistoryQuizState, ChinaHistoryQuizAction, ChinaHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChinaHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chinaHistoryQuizPlugin: GamePlugin<ChinaHistoryQuizState, ChinaHistoryQuizAction, typeof settings> = {
  id:"china-history-quiz", title:"Chinese History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quiz on Chinese history: dynasties, leaders, and pivotal events spanning millennia.",
  howToPlay:"Chinese History Quiz tests your knowledge of one of the world's longest continuous civilizations. Questions span the Shang and Zhou dynasties, the unification under Qin Shi Huang, the golden age of Tang and Song, the Mongol Yuan, the powerful Ming, the foreign Qing, the Republican era, and modern People's Republic. Expect questions about the Great Wall, the Forbidden City, the Silk Road, key emperors, philosophers like Confucius and Laozi, and twentieth-century leaders.\n\nYou have 15 seconds per question. Correct answers award 100 base points plus 10 points per second remaining. Wrong answers earn zero, but the correct answer is revealed.\n\nTap a choice and press Submit. Right answers glow green, wrong ones turn red. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a history major, a fan of Three Kingdoms-era novels, or just curious about the world's most populous country, this quiz will challenge you on the depth and drama of Chinese history.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChinaHistoryQuizSettings),
  reducer,isTerminal,component:ChinaHistoryQuizGame,
};
