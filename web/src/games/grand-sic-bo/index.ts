import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrandSicBoState, GrandSicBoAction, GrandSicBoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrandSicBoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const grandSicBoPlugin: GamePlugin<GrandSicBoState, GrandSicBoAction, typeof settings> = {
  id: "grand-sic-bo",
  title: "Grand Sic Bo",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-dice casino classic with multiplied payouts. Predict total range.",
  howToPlay: "Grand Sic Bo is a lightning-style version of the Asian three-dice casino game where payouts are multiplied across rounds. Each round you call which range the three-dice total will fall into: Small (4-10), Big (11-17), or Triple (any three-of-a-kind, regardless of total).\n\nThe rule of thumb: Small and Big each cover 105 of 216 outcomes (about 48.6%, with three-of-a-kind exclusions). Triples are the rarest (6 of 216, about 2.8%). In Grand Sic Bo, Small and Big each pay 18 points, while Triple pays a thumping 150 points. Your job is to time your Triple bets right.\n\nThe game runs 10 rounds. There are no rerolls; the seeded RNG determines each three-dice roll. Triples knock out the Big/Small bets — if you bet Big or Small but the dice come up triple, you lose. Average expected score lands near 80 points. A single triple bet can vault you above 200.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrandSicBoSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-grand-sic-bo-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-grand-sic-bo-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-grand-sic-bo-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-grand-sic-bo-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-grand-sic-bo-next"]', pulses: 3 };
  },
  component: GrandSicBoGame,
};
