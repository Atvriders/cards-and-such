import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrictracState, TrictracAction, TrictracSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrictracGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const trictracPlugin: GamePlugin<TrictracState, TrictracAction, typeof settings> = {
  id: "trictrac",
  title: "Trictrac (Hit Points)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "17th-century French backgammon — earn 'points' on rolls.",
  howToPlay: "Trictrac is the elaborate 17th-century French ancestor of modern backgammon, played at the court of Louis XIV with a complex 'point counting' system on every roll. This adaptation focuses on Trictrac's distinctive scoring of dice rolls into named hit points. Across 14 rounds two dice are rolled. Call: Doublet (both dice equal) pays +30, High Sum (8-12) pays +15, Low Sum (2-7) pays +12. Doublets occur 1 in 6 rolls so the +30 payout balances. High and Low sums split roughly evenly with mid sums (7) tilting Low. Wrong call scores zero. Strategy: doublet hunts beat low-sum guessing only if you call them at least every fourth round — fewer than that and the +30 accumulates faster than the steady +12. Fourteen rounds, top score wins. The original game had hundreds of named scoring patterns; this captures the essence of Trictrac's roll-by-roll point bookkeeping that fascinated Pascal and Fermat.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrictracSettings),
  reducer,
  isTerminal,
  component: TrictracGame,
};
