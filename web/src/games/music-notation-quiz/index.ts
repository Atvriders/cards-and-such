import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MusicNotationQuizState, MusicNotationQuizAction, MusicNotationQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MusicNotationQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const musicNotationQuizPlugin: GamePlugin<MusicNotationQuizState, MusicNotationQuizAction, typeof settings> = {
  id:"music-notation-quiz", title:"Music Notation Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify clefs, rests, articulations, and standard music notation symbols.",
  howToPlay:"Music Notation Quiz drills the symbols, signs, and conventions of written music. Treble clef, bass clef, alto clef, time signatures, accidentals, rests, ties, slurs, articulations, repeat barlines, dynamics — if it appears on a staff, it could appear here.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Performers, sight-readers, and music students alike will sharpen their fluency through this notation pop-quiz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MusicNotationQuizSettings),
  reducer,isTerminal,component:MusicNotationQuizGame,
};
