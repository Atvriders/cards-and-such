import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MountainQuizState, MountainQuizAction, MountainQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MountainQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mountainQuizPlugin: GamePlugin<MountainQuizState, MountainQuizAction, typeof settings> = {
  id:"mountain-quiz", title:"Mountain Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's famous mountains. 10 or 20 questions.",
  howToPlay:"Mountain Quiz tests your knowledge of the planet's most iconic peaks and ranges. Questions cover everything from the giants of the Himalayas (Everest, K2, Annapurna) to legendary climbing destinations (Matterhorn, Eiger, Mont Blanc) to the highest points on each continent.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nThe pool also pulls in geological terms, country borders, and historical context: which range divides Europe and Asia, where Vesuvius looms, why Mount Elbrus tops Europe (depending who you ask). Some answers depend on technicalities \u2014 Denali was Mount McKinley, the highest in North America; Aconcagua reigns over the Andes.\n\nChoose 10 or 20 questions in Settings. Whether you're a serious mountaineer planning your next ascent or an armchair geographer, this quiz will test how high your knowledge climbs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MountainQuizSettings),
  reducer,isTerminal,component:MountainQuizGame,
};
