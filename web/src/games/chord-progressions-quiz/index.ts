import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChordProgressionsQuizState, ChordProgressionsQuizAction, ChordProgressionsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChordProgressionsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chordProgressionsQuizPlugin: GamePlugin<ChordProgressionsQuizState, ChordProgressionsQuizAction, typeof settings> = {
  id:"chord-progressions-quiz", title:"Chord Progressions Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify common chord progressions across pop, jazz, and classical.",
  howToPlay:"Chord Progressions Quiz tests your ear and your theory: I-V-vi-IV, ii-V-I, twelve-bar blues, the 50s progression, modal vamps, and other staples of Western harmony. Questions span pop, jazz, classical, blues, and beyond — if you've heard the chords, you should recognize them by name and number.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Songwriters, performers, and music nerds will love comparing the harmonic engines that drive countless hits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChordProgressionsQuizSettings),
  reducer,isTerminal,component:ChordProgressionsQuizGame,
};
