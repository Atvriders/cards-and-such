import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStratArenaState, DiceStratArenaStateAction, DiceStratArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratArenaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStratArenaPlugin: GamePlugin<DiceStratArenaState, DiceStratArenaStateAction, typeof settings> = {
  id: "dice-strat-arena", title: "Dice Strat Arena Football", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Faster-scoring arena football sim — tight field, more touchdowns.",
  howToPlay: "Dice Strat Arena Football models the 6-Man arena variant of Strat-O-Matic Football. Arena football plays on a 50-yard field with a 30-second clock and just six players per side, leading to faster scoring and frequent end-zone trips. The Strat-O-Matic 6-Man cards reflect this with shorter scoring runs and higher big-play probability.\n\nThis dice-only sim keeps the breakneck pace. Each round (a play), you Roll three dice. Outcomes: triple (rush touchdown +7 your team), sum >= 13 (long touchdown bomb +7 your team), sum <= 5 (interception return TD opp +7), otherwise short gain (+1 yard, no score change).\n\nGame ends at 35 your points or 10 rounds (mirroring arena's 4 quarter pacing). Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Average runs 130 to 180; a four-touchdown blitz can smash 200. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceStratArenaSettings),
  reducer, isTerminal, component: DiceStratArenaGame,
};
