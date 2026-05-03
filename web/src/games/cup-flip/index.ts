import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CupFlipState, CupFlipAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CupFlip } from "./CupFlip.js";

export const cupFlipSettings = {} as const;

type CFSettingsType = SettingsOf<typeof cupFlipSettings>;

export const cupFlipPlugin: GamePlugin<CupFlipState, CupFlipAction, typeof cupFlipSettings> = {
  id: "cup-flip",
  title: "Cup Flip",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the cups shuffle and find the hidden ball — classic shell game!",
  howToPlay: `Cup Flip is the classic shell game reimagined as a digital dexterity and memory challenge. A ball is hidden under one of three cups, and you must track it through a series of rapid shuffles before selecting the correct cup.

Each round begins with the ball briefly visible under a cup. Watch carefully as the cups begin to slide and swap positions. The cups may cross over each other, switch in straight lines, or reverse direction — keep your eyes on the cup covering the ball and don't let it out of your sight.

Once the shuffling stops, click the cup you believe hides the ball. If you're correct, you earn points based on the number of shuffles in that round — more shuffles means a harder track and a higher reward. A wrong guess scores nothing for that round.

The game progresses through six rounds. Each round increases both the shuffle speed and the number of swaps, making tracking significantly harder as you advance. By round six, the cups move quickly with many swaps that can fool even a careful watcher.

Tips: Pick one cup at the start and never take your eyes off it. Don't track the ball itself — track the container. If you lose track mid-shuffle, try to narrow it down logically by elimination. Practice slowing your eyes rather than speeding them up.`,
  settings: cupFlipSettings,
  initialState: (seed: number, _settings: CFSettingsType) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-cup-flip-action"]', pulses: 3 }; },
  component: CupFlip,
};
