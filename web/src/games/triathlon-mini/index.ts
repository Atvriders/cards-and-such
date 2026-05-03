import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TriathlonState, TriathlonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriathlonMini } from "./Game.js";

export const triathlonMiniPlugin = {
  id: "triathlon-mini",
  title: "Triathlon Mini",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race through three events — swimming, cycling, and running. Tap rhythmically to build speed and manage your stamina across all three legs!",
  howToPlay: `Triathlon Mini is a rhythm-based arcade game where you compete across three consecutive events: Swim, Bike, and Run.

In each event you control a progress bar that represents your distance through that leg of the race. Your athlete moves forward automatically, but tapping the TAP button builds speed and prevents your pace from dropping.

Speed is king: the faster you go, the quicker your progress bar fills. Speed decays slightly every tick without a tap, so you must keep tapping to maintain momentum. But tapping costs Stamina — if your stamina drops below 40%, your effective speed is cut by 40%.

Rhythm Bonus: tap at a consistent interval (roughly every 1.2 seconds) to activate a Combo multiplier. Rhythmic tapping gives a much bigger speed boost than random mashing. Your Combo counter shows your current streak.

Between events your stamina partially recovers, giving you a fresh start for each leg. Finish each event as fast as possible to maximize your score.

Your total score is the sum of event scores — each based on how quickly you completed that leg. Score 80+ for Champion status!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TriathlonState, action: TriathlonAction) => TriathlonState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-triathlon-mini-action"]', pulses: 3 }; },
  component: TriathlonMini,
} as unknown as GamePlugin;
