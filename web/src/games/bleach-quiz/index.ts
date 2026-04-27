import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BleachQuizState, BleachQuizAction, BleachQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BleachQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bleachQuizPlugin: GamePlugin<BleachQuizState, BleachQuizAction, typeof settings> = {
  id:"bleach-quiz", title:"Bleach Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Bleach knowledge: Soul Reapers, Hollows, Bankai, and the Thirteen Court Guard Squads.",
  howToPlay:`Bleach Quiz tests your knowledge of Tite Kubo's supernatural shonen masterpiece. Questions cover the Soul Society, the Thirteen Court Guard Squads, the Espada, the Visored, the Quincy, Hollows, Arrancar, Bankai releases, Hollowfication, Aizen's master plan, the Thousand-Year Blood War, and Ichigo Kurosaki's journey from Karakura Town student to legendary Substitute Soul Reaper.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions. From Soul Reaper basics to the Soul King's secrets, see if your reiatsu can rival a Captain's.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BleachQuizSettings),
  reducer,isTerminal,component:BleachQuizGame,
};
