import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStratHockeyState, DiceStratHockeyStateAction, DiceStratHockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratHockeyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStratHockeyPlugin: GamePlugin<DiceStratHockeyState, DiceStratHockeyStateAction, typeof settings> = {
  id: "dice-strat-hockey", title: "Dice Strat Hockey", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Strat-style hockey sim with dice goal resolution.",
  howToPlay: "Dice Strat Hockey models Strat-O-Matic Hockey, where shot cards roll against goalie save cards to resolve scoring chances. The original simulates real NHL teams with goalie ratings dramatically affecting shot conversion rates — a Vezina-caliber goalie turns 92% of shots aside.\n\nThis dice-only sim keeps the rhythm. Each round (a shift), you Roll three dice. Outcomes: triple (your goal +1 — top shelf, glove side!), sum >= 15 (your goal +1, blocker save high), sum <= 6 (opponent breaks out, opp goal +1), otherwise routine save (no change).\n\nGame ends at 8 your goals or 15 rounds (a typical NHL period structure scaled). Final score formula: 80 + (5 × your goals) - (3 × opponent goals) + (2 × rounds remaining if you finish early). Average runs 110 to 145. Hockey's low-scoring nature makes a clean 4-1 win feel like a dominant playoff performance. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceStratHockeySettings),
  reducer, isTerminal, component: DiceStratHockeyGame,
};
