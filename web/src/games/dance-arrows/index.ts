import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DanceArrowsState, DanceArrowsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DanceArrows } from "./DanceArrows.js";

export const danceArrowsSettings = {} as const;

export const danceArrowsPlugin: GamePlugin<DanceArrowsState, DanceArrowsAction, typeof danceArrowsSettings> = {
  id: "dance-arrows",
  title: "Dance Arrows",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "DDR-style arrow sequence memory game. Watch the pattern, then repeat it!",
  howToPlay: `Dance Arrows is a DDR-inspired sequence memory game. Four directional arrows appear on screen: Up, Down, Left, and Right. Each round the game flashes a sequence of arrows one at a time. Your job is to watch carefully and then repeat the exact sequence by clicking the matching arrow buttons.

Press Start to begin. The game highlights each arrow in the sequence for a brief moment — pay attention to the order! Once the sequence finishes flashing, the input phase begins and it's your turn. Click the arrows in the same order they were shown.

Each correct press advances to the next arrow in the sequence. If you press the wrong arrow, the round ends and your score equals the number of rounds you successfully completed before the mistake. Get it right and you move to the next round, which adds one more arrow to the sequence.

Strategy tips: Break the sequence into short chunks of 2 or 3 arrows. Try saying the direction names in your head as you watch — "up, left, down" — forming a verbal rhythm. After a few rounds, focus on the transitions between arrows rather than individual arrows. The sequence grows by one each round, so early accuracy builds a strong foundation for longer chains. How far can you go?`,
  settings: danceArrowsSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dance-arrows-action"]', pulses: 3 }; },
  component: DanceArrows,
};
