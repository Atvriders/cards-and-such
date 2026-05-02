import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AllAmericanVpState, AllAmericanVpAction, AllAmericanVpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AllAmericanVpGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const allAmericanVpPlugin: GamePlugin<AllAmericanVpState, AllAmericanVpAction, typeof settings> = {
  id: "all-american-vp", title: "All American Video Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker variant favoring flushes and straights.",
  howToPlay: "All American Video Poker is a draw-poker machine variant featuring elevated payouts on flushes, straights, and straight flushes at the cost of slightly worse payouts on full houses and four-of-a-kind. The pay-table favours mid-range hands.\n\nIn this single-player drill you play fifteen rounds. Each round the engine deals five cards and pays out using a poker-rank schedule: pair of jacks-or-better one point, two pair two, three-of-a-kind three, straight four, flush six, full house nine, four-of-a-kind twenty-five, straight flush fifty, royal flush two hundred and fifty.\n\nLow pairs (twos through tens) pay nothing.\n\nExpected score across fifteen rounds is thirty-five to seventy. All American's straight-and-flush bias produces slightly higher hit rates on those mid-range hands; expect at least one across fifteen. The long-tail royal flush is a roughly one-in-forty-thousand event, but a single straight flush will dominate the round set.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AllAmericanVpSettings),
  reducer, isTerminal,
  hint: (state: AllAmericanVpState): HintTarget | null => isTerminal(state) ? null : { selector: '[data-testid="hint-target-all-american-vp-primary"]', pulses: 3 },
  component: AllAmericanVpGame,
};
