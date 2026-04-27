import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BBQQuizState, BBQQuizAction, BBQQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BBQQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bbqQuizPlugin: GamePlugin<BBQQuizState, BBQQuizAction, typeof settings> = {
  id:"bbq-quiz", title:"BBQ Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Smoke through American barbecue regions, cuts, and methods in thirty saucy questions.",
  howToPlay:"BBQ Quiz tests your knowledge of America's smoky, slow-cooked obsession. Questions cover the four big regional traditions — Texas (beef brisket, dry rubs), Kansas City (sweet sticky sauces, burnt ends), Memphis (dry-rubbed ribs, vinegar mops), and the Carolinas (whole hog, pork shoulder, mustard sauces). You'll see questions on cuts of meat, smoking woods, internal temperatures, the difference between hot-and-fast and low-and-slow, and competition categories like ribs, brisket, pulled pork, and chicken.\n\nEach question gives you 15 seconds. Correct answers reward 100 base points plus 10 points per second remaining. Wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers light up green; wrong ones go red. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you're a competition pitmaster, a backyard weekend warrior, or just a sauce-lover who knows good ribs, this quiz delivers a full rack of barbecue trivia.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BBQQuizSettings),
  reducer,isTerminal,component:BBQQuizGame,
};
