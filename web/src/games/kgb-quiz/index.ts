import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KgbQuizState, KgbQuizAction, KgbQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KgbQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kgbQuizPlugin: GamePlugin<KgbQuizState, KgbQuizAction, typeof settings> = {
  id:"kgb-quiz", title:"KGB History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Soviet KGB.",
  howToPlay:"KGB History Quiz tests your knowledge of the Komitet Gosudarstvennoy Bezopasnosti — the Soviet Union's primary security and intelligence agency from 1954 to 1991. Questions cover its founding, predecessors (Cheka, NKVD, MGB), notable directors like Yuri Andropov, internal Directorates, foreign operations, famous defectors, the dissolution after the August coup, and successor agencies FSB, SVR and GRU.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10 or 20 questions in Settings. From Lubyanka Square to wet jobs and active measures, this quiz spans the KGB's dramatic and often dark history.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KgbQuizSettings),
  reducer,isTerminal,
  hint: (state: KgbQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KgbQuizGame,
};
