import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RepeatAfterMeState, RepeatAfterMeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RepeatAfterMe } from "./RepeatAfterMe.js";

export const repeatAfterMeSettings = {} as const;

export const repeatAfterMePlugin: GamePlugin<RepeatAfterMeState, RepeatAfterMeAction, typeof repeatAfterMeSettings> = {
  id: "repeat-after-me",
  title: "Repeat After Me",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch a sequence of body actions, then perform them in the same order.",
  howToPlay: `Repeat After Me is an energetic body-action memory game inspired by the classic playground game. Four actions are available: Clap, Stomp, Snap, and Tap. Each round a sequence of these actions is shown by highlighting them one by one. You then have to perform the exact same sequence by clicking the action buttons.

Press Start to see the demonstration. Watch each action light up in order. When the full sequence has been shown, it's your turn. Click the actions in the same order to match what was demonstrated. A correct action advances to the next step; a wrong one ends the game.

Your score equals the number of complete rounds you successfully performed before making a mistake. Each round grows the sequence by one, challenging your memory further.

This game is inspired by call-and-response games where a leader performs a rhythm pattern and the group echoes it back. Try to let each action create a mental image — visualize yourself actually clapping, stomping, snapping, or tapping as you watch. Group consecutive similar actions together: "clap-clap, stomp, snap" becomes a short phrase. Saying the names aloud softly while watching also strengthens recall. After enough rounds, you may find yourself anticipating the next action before it appears — a sure sign your pattern recognition is improving.`,
  settings: repeatAfterMeSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-repeat-after-me-action"]', pulses: 3 }; },
  component: RepeatAfterMe,
};
