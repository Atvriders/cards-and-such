import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MunchkinZombiesQuizState, MunchkinZombiesQuizAction, MunchkinZombiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MunchkinZombiesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const munchkinZombiesQuizPlugin: GamePlugin<MunchkinZombiesQuizState, MunchkinZombiesQuizAction, typeof settings> = {
  id:"munchkin-zombies-quiz", title:"Munchkin Zombies Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Munchkin Zombies, the undead-themed Munchkin standalone.",
  howToPlay:"Munchkin Zombies Trivia is a ten-question quiz about the standalone zombie-themed entry in the Munchkin franchise where players are zombies, brains replace treasure, and the iconic monsters are humans trying to defeat the zombies. Each round you'll be tested on the publisher Steve Jackson Games, the Powers (Pus, Sloth, etc.) replacing classes, the types of monsters and Toxic Avengers, and the level cap. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Munchkin Zombies flips the genre by making the players the monsters — see how much you remember about this brain-hungry favourite.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MunchkinZombiesQuizSettings),
  reducer,isTerminal,
  hint: (state: MunchkinZombiesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MunchkinZombiesQuizGame,
};
