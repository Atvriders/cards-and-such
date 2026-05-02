import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ElectronicMusicQuizState, ElectronicMusicQuizAction, ElectronicMusicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ElectronicMusicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const electronicMusicQuizPlugin: GamePlugin<ElectronicMusicQuizState, ElectronicMusicQuizAction, typeof settings> = {
  id:"electronic-music-quiz", title:"Electronic Music Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Electronic music: Kraftwerk, Daft Punk, Aphex Twin, and the genres they shaped.",
  howToPlay:`Electronic Music Quiz covers the entire spectrum of electronic music, from German pioneers Kraftwerk through Detroit techno, Chicago house, ambient and IDM, drum and bass, dubstep, EDM, and beyond. Questions feature Kraftwerk, Daft Punk, Aphex Twin, Brian Eno, Moby, Skrillex, Deadmau5, and the labels and clubs that defined electronic culture.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 per second remaining on the clock — speed counts. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong answers turn red, and the right answer is shown before you continue. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. From basement raves to festival mainstages, this quiz tests your synth-and-sampler smarts. Drop the bass!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ElectronicMusicQuizSettings),
  reducer,isTerminal,
  hint: (state: ElectronicMusicQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ElectronicMusicQuizGame,
};
