import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MusicTrivia } from "./Game.js";

const musicTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type MusicTriviaSettingsType = SettingsOf<typeof musicTriviaSettings>;

export const musicTriviaPlugin: GamePlugin<QuizState, QuizAction, typeof musicTriviaSettings> = {
  id: "music-trivia",
  title: "Music Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your music knowledge — bands, artists, hit songs, instruments, genres, and music history from classical to pop.",
  howToPlay: `Music Trivia puts your knowledge of all things musical to the test. Questions cover a wide range of topics: legendary artists, iconic albums and songs, musical instruments, genres, classical composers, and key moments in music history.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Answering instantly scores 100 + 150 = 250 points, while waiting until the final second earns only 100 + 10 = 110. Wrong answers score zero.

Click a choice to select it, then press Submit. After submitting, the correct answer is highlighted in green and any wrong pick is highlighted in red. Press Next to advance to the next question.

Configure how many questions to play in Settings — 10 for a quick jam session, 20 for a standard set, or 30 for the full concert. Questions are selected randomly from a curated pool of 32 music facts spanning centuries of musical heritage.

At the end you'll see your final score and accuracy. Whether you're a pop enthusiast, classical aficionado, or rock historian, Music Trivia will challenge even the most devoted music fan.`,
  settings: musicTriviaSettings,
  initialState: (seed: number, settings: MusicTriviaSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-music-trivia-answer-0"]', pulses: 3 } : null,component: MusicTrivia,
};
