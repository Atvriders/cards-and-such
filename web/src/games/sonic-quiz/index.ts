import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SonicState, SonicAction, SonicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SonicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sonicQuizPlugin: GamePlugin<SonicState, SonicAction, typeof settings> = {
  id:"sonic-quiz", title:"Sonic the Hedgehog Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Sonic the Hedgehog: SEGA's blue blur and his friends.",
  howToPlay:"Sonic the Hedgehog Quiz tests your knowledge of SEGA's high-speed mascot platformer franchise, from the original 1991 Genesis classic to Sonic Frontiers and the modern movies. Questions cover Sonic, Tails, Knuckles, Amy Rose, Shadow, Rouge, Cream, Big the Cat, Dr. Eggman, Metal Sonic, and the wider cast — plus zones, Chaos Emeralds, console history, the films, and three decades of high-velocity hedgehog action.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. Gotta go fast!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SonicSettings),
  reducer,isTerminal,
  hint: (state: SonicState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SonicQuizGame,
};
