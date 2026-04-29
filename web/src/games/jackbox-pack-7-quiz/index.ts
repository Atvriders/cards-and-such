import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JackboxPack7QuizState, JackboxPack7QuizAction, JackboxPack7QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JackboxPack7QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const jackboxPack7QuizPlugin: GamePlugin<JackboxPack7QuizState, JackboxPack7QuizAction, typeof settings> = {
  id:"jackbox-pack-7-quiz", title:"Jackbox Party Pack 7 Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Jackbox Party Pack 7: Quiplash 3, Champ'd Up, Talking Points, Blather Round, Devils and Details.",
  howToPlay:"Jackbox Party Pack 7 Trivia tests your knowledge of the seventh Jackbox bundle — the one with Quiplash 3, Champ'd Up, Talking Points, Blather Round, and The Devils and the Details. Questions span the games included, the release year, the audience features, and the publisher. Each round delivers ten questions. Tap an answer and press Submit. A correct answer earns 100 base points plus 10 points per second left on the 15-second timer; a wrong one reveals the correct option and locks the round. Press Next to advance. After ten questions, your final score appears. Whether you've improvised a slideshow in Talking Points, drawn a champion in Champ'd Up, or shouted at your roommate trying to escape Detail Hell, this quiz will rate how thoroughly you remember the seventh Pack's lineup.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JackboxPack7QuizSettings),
  reducer,isTerminal,component:JackboxPack7QuizGame,
};
