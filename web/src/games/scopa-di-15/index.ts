import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScopaDi15State, ScopaDi15Action, ScopaDi15Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScopaDi15Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: ScopaDi15State): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const scopaDi15Plugin: GamePlugin<ScopaDi15State, ScopaDi15Action, typeof settings> = {
  id: "scopa-di-15", title: "Scopa di 15", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scopa variant: capture summing to 15. High card wins.",
  howToPlay: "Scopa di 15 is an Italian Scopa variant where you capture by summing your card with table cards to exactly 15 (instead of the standard match-rank capture). This mini-version simulates that with a generous per-round payout.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a successful capture-to-15). Aces (1) low, Kings (10 in Scopa) high. Italian deck values are 1-7 + Knave/Jack/King but for this 52-deck version, normal A-K ranks apply.\n\nScoring: round win awards 15 points (echoing the target sum). Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds total. Expected score: 60-80 points; lucky runs cross 90.\n\nThe full Scopa di 15 plays with a 40-card Italian deck (no 8s, 9s, 10s) and the eponymous sum-to-15 capture is the only legal move. This mini honors the namesake numerology with a 15-point payoff per win. Less authentic, more accessible — if you've never played Scopa, this is a friendly door.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScopaDi15Settings),
  reducer, isTerminal, hint, component: ScopaDi15Game,
};
