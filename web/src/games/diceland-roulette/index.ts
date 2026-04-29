import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicelandRouletteState, DicelandRouletteAction, DicelandRouletteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicelandRouletteGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicelandRoulettePlugin: GamePlugin<DicelandRouletteState, DicelandRouletteAction, typeof settings> = {
  id: "diceland-roulette",
  title: "Diceland Roulette",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roulette simulated with two dice. Bet on color, parity, or low/high.",
  howToPlay: "Diceland Roulette folds the spirit of roulette into a two-dice game. Each round you place one of three bets on the upcoming dice sum (2-12): Red (sums 2, 4, 6, 8, 10, 12 — the even sums), Black (sums 3, 5, 7, 9, 11 — the odd sums), or Low (sums 2 through 6).\n\nRed wins on 18 of 36 outcomes (50%) and pays 12. Black wins on 18 of 36 outcomes (50%) and pays 12. Low wins on 15 of 36 outcomes (41.7%) and pays 16. The expected value is similar across all bets (around 6) — the game rewards consistency and the gambler's nerve.\n\nUnlike real roulette, there's no zero pocket or house edge here. The game runs 12 rounds. Average expected score lands near 70 points. Calling Low aggressively when on a roll can vault you above 100. Diceland Roulette pairs the classic feel of even-money roulette with the satisfying clatter of two cube dice.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DicelandRouletteSettings),
  reducer,
  isTerminal,
  component: DicelandRouletteGame,
};
