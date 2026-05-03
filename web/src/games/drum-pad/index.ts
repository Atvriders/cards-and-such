import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DrumPadState, DrumPadAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrumPad } from "./DrumPad.js";

export const drumPadSettings = {} as const;

export const drumPadPlugin: GamePlugin<DrumPadState, DrumPadAction, typeof drumPadSettings> = {
  id: "drum-pad",
  title: "Drum Pad",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch a drum pattern flash, then replay it hit by hit on the pads.",
  howToPlay: `Drum Pad is a rhythm memory game featuring four drum sounds: Kick, Snare, Hi-Hat, and Tom. Each round the game flashes a drum pattern by highlighting each pad in sequence. Your goal is to repeat the exact pattern by hitting the pads in the same order.

Press Start to watch the pattern. Each pad lights up in turn, showing you the beat sequence. Once the full pattern has been shown, the pads become active and it's your turn to perform. Click each pad in the correct order to reproduce the rhythm.

A correct hit records your input. An incorrect hit ends the game. Your score is the number of rounds you successfully completed before making a mistake. Each new round adds one more hit to the pattern, making it increasingly complex.

Strategy tips: Try to connect the visual pad flashes with real drum sounds in your head. The Kick is the bass drum (boom), the Snare is the sharp crack, the Hi-Hat is the tick, and the Tom is the medium knock. Inventing a vocal rhythm — like "boom-tick-crack-knock" — helps your brain store the pattern as a rhythm rather than a random sequence. For longer patterns, focus on recognizing repeating sub-patterns within the beat. Drummers naturally chunk beats into groups of four; try the same approach here.`,
  settings: drumPadSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-drum-pad-action"]', pulses: 3 }; },
  component: DrumPad,
};
