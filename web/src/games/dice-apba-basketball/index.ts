import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceApbaBasketballState, DiceApbaBasketballStateAction, DiceApbaBasketballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceApbaBasketballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceApbaBasketballPlugin: GamePlugin<DiceApbaBasketballState, DiceApbaBasketballStateAction, typeof settings> = {
  id: "dice-apba-basketball", title: "Dice APBA Basketball", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "APBA card-based NBA simulation; tendencies captured.",
  howToPlay: "Dice APBA Basketball models the APBA card-based NBA simulation system, a longtime rival to Strat-O-Matic. APBA cards code real player tendencies — scoring, rebounding, assists, fouls — into a numeric grade. Star players play differently from role players in a way faithful to the actual NBA season.\n\nThis dice-only edition keeps the rhythm. Each round (a possession), you Roll three dice. Outcomes: triple (your three-pointer +3 your team), sum >= 14 (mid-range basket +2 your team), sum <= 7 (offensive foul or steal opp +2), otherwise miss (no change).\n\nGame ends at 60 your points or 14 rounds (typical NBA quarter structure scaled). Final score formula: 80 + (4 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). APBA games trend higher-scoring than Strat with three-pointers being more common. Average runs 130 to 180. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceApbaBasketballSettings),
  reducer, isTerminal, component: DiceApbaBasketballGame,
};
