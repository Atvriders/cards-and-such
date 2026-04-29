import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStratFootballState, DiceStratFootballStateAction, DiceStratFootballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratFootballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStratFootballPlugin: GamePlugin<DiceStratFootballState, DiceStratFootballStateAction, typeof settings> = {
  id: "dice-strat-football", title: "Dice Strat Football", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Card-and-dice football sim; play-call dice resolve yardage gains.",
  howToPlay: "Dice Strat Football models the Strat-O-Matic card-and-dice football simulator. In the original game, real NFL play-call cards are matched against defensive formation cards, with three dice resolving the play. Long touchdown bombs and short conservative dive plays both have realistic probability distributions tied to the actual NFL player cards.\n\nThis dice-only edition strips the cards but keeps the spirit. Each round (a play), you Roll three dice. Outcomes: triple (touchdown +7 your team), sum >= 14 (first down +3), sum <= 6 (sack -2 yards or interception, +2 to opponent), otherwise short gain (+1 yard, no score change).\n\nGame ends at 30 your points or after 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Average runs land 110 to 150; a 30-point shutout can clear 180. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceStratFootballSettings),
  reducer, isTerminal, component: DiceStratFootballGame,
};
