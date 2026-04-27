import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MetalGearState, MetalGearAction, MetalGearSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MetalGearQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const metalGearQuizPlugin: GamePlugin<MetalGearState, MetalGearAction, typeof settings> = {
  id:"metal-gear-quiz", title:"Metal Gear Solid Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Metal Gear Solid: tactical espionage and Solid Snake.",
  howToPlay:"Metal Gear Solid Quiz tests your knowledge of Hideo Kojima's pioneering stealth action franchise, from the original 1987 MSX2 Metal Gear through Metal Gear Solid V: The Phantom Pain. Questions cover the saga's protagonists — Solid Snake, Big Boss (Naked Snake), Raiden, Venom Snake — plus Liquid, Solidus, Otacon, Meryl, Ocelot, The Boss, Quiet, and the convoluted, delightful Patriots/Outer Heaven mythology that ties it all together.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. Kept you waiting, huh?",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MetalGearSettings),
  reducer,isTerminal,component:MetalGearQuizGame,
};
