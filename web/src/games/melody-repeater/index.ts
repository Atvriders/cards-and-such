import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MelodyRepeaterState, MelodyRepeaterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MelodyRepeater } from "./MelodyRepeater.js";

export const melodyRepeaterSettings = {} as const;

export const melodyRepeaterPlugin: GamePlugin<MelodyRepeaterState, MelodyRepeaterAction, typeof melodyRepeaterSettings> = {
  id: "melody-repeater",
  title: "Melody Repeater",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Listen to the melody, then replay it note by note on the keyboard.",
  howToPlay: `Melody Repeater challenges your musical memory. Six notes from the C major scale — C, D, E, F, G, and A — are displayed as piano-style keys. Each round the game plays a melody by highlighting the notes in sequence. Your task is to reproduce that exact melody by clicking the keys in the same order.

Press Start to hear the melody. Each note lights up briefly as it plays. Once the whole melody has been shown, the input phase begins. Click the notes in the exact order you saw them. A correct note advances your position; a wrong note ends the game and your score is the number of rounds you successfully cleared.

Each successful round adds one new note to the melody, making it progressively longer and more challenging. The melody grows from a single note up to whatever length your memory allows.

Tips: Try humming or quietly saying the note names aloud as they light up — "C, E, G, C" — to create a vocal-memory anchor. Group notes into clusters of 3. Pay attention to repeated notes; they are easy to lose track of. Focus on the shape of the sequence rather than individual notes. With practice, you will start to hear the melody as a musical phrase, which is much easier to remember than a list of letters. How many rounds can you complete?`,
  settings: melodyRepeaterSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-melody-repeater-action"]', pulses: 3 }; },
  component: MelodyRepeater,
};
