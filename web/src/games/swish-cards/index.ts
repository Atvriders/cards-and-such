import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwishCardsState, SwishCardsAction, SwishCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SwishCardsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const swishCardsPlugin: GamePlugin<SwishCardsState, SwishCardsAction, typeof settings> = {
  id: "swish-cards", title: "Swish Cards", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick overlay where dot aligns with circle.",
  howToPlay: "Swish Cards adapts the transparent-card overlay game. Each round shows you a target circle position on a 4x4 grid (e.g., '(2,3)') and asks which of four candidate dot-overlays would land a dot in that circle. Pick the matching coordinate from four candidates, hit Submit, score ten points if right. Twelve rounds total, max 120 points. The original Swish uses see-through plastic cards with circles and dots; sliding a dot card over a circle card 'swishes' them when aligned. This digital version represents that same alignment puzzle as coordinate matching. Sharp spatial reasoners score 100+; first-timers 60-90. Each round is independent and untimed. Hit Submit to lock, Next to advance. Swish Cards trains x-y coordinate fluency and rapid spatial matching, both useful in math and design contexts. Plays in under a minute total. The full original Swish includes physical card manipulation; this captures the puzzle essence quickly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SwishCardsSettings),
  reducer, isTerminal, hint: (state: SwishCardsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-swish-cards-answer-0"]', pulses: 3 } : null, component: SwishCardsGame,
};
