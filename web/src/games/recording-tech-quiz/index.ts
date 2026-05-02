import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RecordingTechQuizState, RecordingTechQuizAction, RecordingTechQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RecordingTechQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const recordingTechQuizPlugin: GamePlugin<RecordingTechQuizState, RecordingTechQuizAction, typeof settings> = {
  id:"recording-tech-quiz", title:"Recording Tech Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"History and tech of recording: tape, vinyl, digital, microphones, studios.",
  howToPlay:"Recording Tech Quiz covers the history of capturing sound: from Edison's wax cylinders to magnetic tape, from vinyl LPs to compact discs, from analog mixing desks to digital audio workstations. The questions span microphone types, famous studios, audio formats, recording milestones, and the engineers behind the sound.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Audio engineers, hi-fi nerds, and music historians will love testing how well they know the tools that shaped the records!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RecordingTechQuizSettings),
  reducer,isTerminal,
  hint: (state: RecordingTechQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:RecordingTechQuizGame,
};
