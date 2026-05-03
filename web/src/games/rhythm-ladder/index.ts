import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RhythmLadderState, RhythmLadderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RhythmLadder } from "./RhythmLadder.js";

export const rhythmLadderSettings = {} as const;

export const rhythmLadderPlugin: GamePlugin<RhythmLadderState, RhythmLadderAction, typeof rhythmLadderSettings> = {
  id: "rhythm-ladder",
  title: "Rhythm Ladder",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch colored rungs light up as they descend the ladder, then climb back up in order.",
  howToPlay: `Rhythm Ladder is a color-sequence memory game presented as a vertical ladder. Each round, colored rungs light up from top to bottom one at a time, like a descending rhythm beat. After all rungs have flashed, you must click the colors in the same top-to-bottom order to climb back up.

Press Start to watch the sequence descend. Each rung glows briefly in its color — red, blue, green, yellow, or purple. After the last rung flashes, the ladder clears and the colored buttons appear. Click them in the order you saw them descend.

A correct click advances your position. An incorrect click ends the game. Your score is the number of rounds you completed before failing. Each new round adds one more rung to the ladder.

Think of the ladder as a musical scale — each rung is a beat descending in a rhythm. To memorize longer sequences, look for color runs: "three blues in a row" or "red-green alternating." The visual rhythm of descending rungs naturally encourages chunking. Saying color names rhythmically in your head ("red... blue, green... yellow") as they flash creates a verbal beat that many players find easier to retain than pure visual memory. With enough rounds you will start recognizing the ladder's signature melody.`,
  settings: rhythmLadderSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-rhythm-ladder-action"]', pulses: 3 }; },
  component: RhythmLadder,
};
