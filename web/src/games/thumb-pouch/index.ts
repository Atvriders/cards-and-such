import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThumbPouchState, ThumbPouchAction, ThumbPouchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThumbPouchGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const thumbPouchPlugin: GamePlugin<ThumbPouchState, ThumbPouchAction, typeof settings> = {
  id: "thumb-pouch",
  title: "Thumb and Pouch",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Klondike variant where same-color sequences are allowed in the tableau, easing the build rules.",
  howToPlay: "Thumb and Pouch is a ten-round seeded solitaire micro-variant inspired by Klondike variant where same-color sequences are allowed in the tableau, easing the build rules. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes same-suit pairs); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nThumb and Pouch loosens classic Klondike by allowing tableau builds on same-color (rather than strictly alternating-color) cards. This micro-variant rewards same-suit pairs in your hand. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThumbPouchSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: ThumbPouchGame,
};
