import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BatmanQuizState, BatmanQuizAction, BatmanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BatmanQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const batmanQuizPlugin: GamePlugin<BatmanQuizState, BatmanQuizAction, typeof settings> = {
  id:"batman-quiz", title:"Batman Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Batman lore: Gotham, the Bat-Family, the Rogues Gallery, and the Dark Knight himself.",
  howToPlay:`Batman Quiz tests your knowledge of DC Comics' Caped Crusader from his 1939 debut to today. Questions cover Bruce Wayne, Wayne Manor and the Batcave, the Bat-Family — Robin (all of them), Batgirl, Nightwing, Red Hood, Oracle — and Gotham's legendary Rogues Gallery: the Joker, Penguin, Riddler, Catwoman, Two-Face, Mr. Freeze, Scarecrow, and the rest of Arkham's worst.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. From the Adam West TV show to The Dark Knight Trilogy, see if you're truly the World's Greatest Detective.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BatmanQuizSettings),
  reducer,isTerminal,component:BatmanQuizGame,
};
