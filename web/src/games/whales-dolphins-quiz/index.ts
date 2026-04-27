import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhalesDolphinsQuizState, WhalesDolphinsQuizAction, WhalesDolphinsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WhalesDolphinsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const whalesDolphinsQuizPlugin: GamePlugin<WhalesDolphinsQuizState, WhalesDolphinsQuizAction, typeof settings> = {
  id:"whales-dolphins-quiz", title:"Whales & Dolphins Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your cetacean knowledge.",
  howToPlay:"Whales & Dolphins Quiz dives into the world of cetaceans — the marine mammals that include the colossal blue whale, intelligent orcas, playful dolphins, and the legendary sperm whale. Questions cover species identification, feeding behaviors, migration patterns, intelligence, and the deep bonds these animals form with one another.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you've watched whales off Maui, swum with dolphins in Hawaii, or just love the ocean, this quiz invites you to explore the giants and acrobats of the sea. Dive in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WhalesDolphinsQuizSettings),
  reducer,isTerminal,component:WhalesDolphinsQuizGame,
};
