import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BandleAudioState, BandleAudioAction, BandleAudioSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BandleAudioGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bandleAudioPlugin: GamePlugin<BandleAudioState, BandleAudioAction, typeof settings> = {
  id: "bandle-audio", title: "Bandle Audio", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify songs by instrument clue.",
  howToPlay: "Bandle Audio adapts the music-guessing puzzle to text-clue form. Each of fifteen rounds describes a song's instrumentation in one phrase ('Distorted guitar riff repeated', 'Saxophone smooth jazz', 'Banjo bluegrass strum') and asks which song matches. Pick from four candidates, hit Submit, score ten points. Max 150 across fifteen rounds. The song pool spans rock (Smoke on the Water, Bohemian Rhapsody, Master of Puppets), pop (Hey Jude, Take On Me, Stayin' Alive, Wonderwall), country (Cotton Eye Joe, Wagon Wheel), reggae (No Woman No Cry), 80s synth (Take On Me), 80s smooth (Careless Whisper), and funk (Another One Bites the Dust). Music fans score 130+; casual listeners 80-110. The clue style intentionally describes texture rather than melody so players use ear-knowledge from memory. Hit Submit to lock and Next to advance. Total run is about a minute and a half.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BandleAudioSettings),
  reducer, isTerminal, hint: (state: BandleAudioState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-bandle-audio-answer-0"]', pulses: 3 } : null, component: BandleAudioGame,
};
