import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarioState, MarioAction, MarioSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarioQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const marioQuizPlugin: GamePlugin<MarioState, MarioAction, typeof settings> = {
  id:"mario-quiz", title:"Super Mario Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Super Mario Bros: Mushroom Kingdom, plumbers, Bowser, and gold coins.",
  howToPlay:"Super Mario Quiz tests your knowledge of Nintendo's flagship platformer franchise, from Donkey Kong (1981) to Super Mario Odyssey and beyond. Questions cover Mario, Luigi, Princess Peach, Princess Daisy, Bowser, Yoshi, Wario, Toad, and the entire Mushroom Kingdom — plus power-ups, enemies, levels, console history, spin-offs (Mario Kart, Mario Party, Smash Bros), and four decades of platforming history.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. It's-a me, your high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MarioSettings),
  reducer,isTerminal,component:MarioQuizGame,
};
