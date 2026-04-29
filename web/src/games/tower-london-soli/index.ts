import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const towerLondonSoliPlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "tower-london-soli",
  title: "Tower of London Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Accordion-relative with three discard stacks; ten-round seeded hand variant.",
  howToPlay: "Tower of London Solitaire is an Accordion-relative with three discard stacks, here adapted as a ten-round seeded hand variant where same-rank pairs in your hand pay big. Each round you receive a fresh hand of five cards drawn from a single seeded deck. Choose Keep & Score to lock the hand and earn points based on rank-pairs (a single pair pays four, two pair pays twelve, trips pay twenty, full house pays thirty), Discard Hand for a one-point consolation, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across ten rounds. Typical totals fall between forty and one hundred ten; the rating ladder is Pass, Fair, Good, Excellent. The stock is fully seeded.\n\nThe original Tower of London tableau allowed three discard towers to compress the deck; this micro-variant captures the spirit by rewarding rank clusters. The seed mechanism enables fair replay against friends. Tower up your pairs, swap when one card is close, and squeeze every drop of bonus out of each tower.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  component: SoliGame,
};
