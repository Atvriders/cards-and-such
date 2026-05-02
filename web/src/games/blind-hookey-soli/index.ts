import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlindHookeySoliState, BlindHookeySoliAction, BlindHookeySoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlindHookeySoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const blindHookeySoliPlugin: GamePlugin<BlindHookeySoliState, BlindHookeySoliAction, typeof settings> = {
  id: "blind-hookey-soli",
  title: "Blind Hookey Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Stripped-down Klondike with random stock reveal and no peeking.",
  howToPlay: "Blind Hookey Solitaire is a ten-round seeded solitaire micro-variant inspired by Stripped-down Klondike with random stock reveal and no peeking. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes rank-spread bonus); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nBlind Hookey is a luck-driven Klondike stripped of careful planning — the stock reveals randomly and you commit before you see. This micro-variant captures that risk-and-reward feel by rewarding wide rank spreads in the hand. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlindHookeySoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-blind-hookey-soli-primary"]', pulses: 3 }),
  component: BlindHookeySoliGame,
};
