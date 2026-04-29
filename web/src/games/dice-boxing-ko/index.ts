import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBoxingKoState, DiceBoxingKoStateAction, DiceBoxingKoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBoxingKoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBoxingKoPlugin: GamePlugin<DiceBoxingKoState, DiceBoxingKoStateAction, typeof settings> = {
  id: "dice-boxing-ko", title: "Dice Boxing KO", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "12-round punch and block sim; stamina track.",
  howToPlay: "Dice Boxing KO models a 12-round professional boxing match. Real boxing scoring uses the 10-point must system — the round winner gets 10, the loser usually 9, with knockdowns reducing further. Knockouts and TKOs end fights early. Stamina degrades over rounds; champions pace themselves.\n\nThis dice-only sim plays 12 rounds. Each round, you Roll three dice. Outcomes: triple (knockdown +3 your team — momentum shift!), sum >= 14 (clear round win +1 your team), sum <= 6 (round lost, opp +1), otherwise even round (no change).\n\nGame ends at 9 your points (decisive win on cards) or 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Boxing rewards aggression balanced by defense — a flurry that misses leaves you exposed. Average runs 110 to 155. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceBoxingKoSettings),
  reducer, isTerminal, component: DiceBoxingKoGame,
};
