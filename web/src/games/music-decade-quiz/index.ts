import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MusicDecadeQuizState, MusicDecadeQuizAction, MusicDecadeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MusicDecadeQuiz } from "./Game.js";

const settings = {
  questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const musicDecadeQuizPlugin: GamePlugin<MusicDecadeQuizState, MusicDecadeQuizAction, typeof settings> = {
  id: "music-decade-quiz",
  title: "Music Decade Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Can you match iconic songs and artists to the right decade? Put your music history to the test!",
  howToPlay: `Music Decade Quiz challenges you to place famous songs, artists, and music movements in their correct decade. From rock and roll's birth in the 1950s through disco, punk, new wave, grunge, hip-hop, and modern pop, each question explores a different era of music history.

Select one of four decade choices and press Submit. A correct answer earns 100 points. The correct answer is revealed after each question so you can expand your music history knowledge.

Topics span: the birth of rock and roll, the British Invasion, Motown, classic rock, disco, punk, synth-pop, grunge, hip-hop origins, EDM, and contemporary pop. Artists covered include The Beatles, Queen, Michael Jackson, Nirvana, Bob Dylan, Prince, the Eagles, Eminem, and Taylor Swift among many others.

Use Settings to play 10 or 20 questions. Questions are randomly selected and choices are shuffled each game for replayability. Whether you grew up in the 70s or discovered music through streaming, this quiz will take you on a tour through the decades!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as MusicDecadeQuizSettings),
  reducer,
  isTerminal,
  component: MusicDecadeQuiz,
};
