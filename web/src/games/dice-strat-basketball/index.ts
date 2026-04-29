import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStratBasketballState, DiceStratBasketballStateAction, DiceStratBasketballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratBasketballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStratBasketballPlugin: GamePlugin<DiceStratBasketballState, DiceStratBasketballStateAction, typeof settings> = {
  id: "dice-strat-basketball", title: "Dice Strat Basketball", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Strat NBA dice sim; shot clock and foul management.",
  howToPlay: "Dice Strat Basketball models Strat-O-Matic Basketball, the seminal card-and-dice NBA simulation that replicates real player abilities. Shot clock tension, foul trouble, and rebounds all factor in the original. Star players have favorable shot cards making their attempts more efficient.\n\nThis dice-only edition keeps the scoring rhythm. Each round (a possession), you Roll three dice. Outcomes: triple (and-one three-pointer +4 your team), sum >= 14 (made basket +2 your team), sum <= 6 (turnover, fast break opp +2), otherwise miss (no change). Average possessions per round mirror real NBA pace.\n\nGame ends at 50 your points or 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Average runs 110 to 160. NBA scoring runs are wild — strings of three triples can swing momentum violently. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceStratBasketballSettings),
  reducer, isTerminal, component: DiceStratBasketballGame,
};
